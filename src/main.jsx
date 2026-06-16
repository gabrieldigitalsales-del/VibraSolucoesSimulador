import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { Download, RotateCcw, Save, Eraser } from 'lucide-react';
import vibraLogo from './assets/logo-vibra.png';
import './style.css';

const STORAGE_KEY = 'simulacao-vibra-solucoes-v3';
const OLD_STORAGE_KEYS = ['simulacao-vibra-solucoes', 'simulacao-vibra-solucoes-v2', 'simulacao-vibra'];

const defaultData = {
  validade: '',
  administradora: '',
  subtitulo: '',
  creditoContratado: 0,
  prazoPagamento: 0,
  parcelasAteContemplacao: 0,
  lanceEmbutido: 0,
  lanceRecursos: 0,
  prazoRestante: 0,
  parcelaApos: 0,
  taxaAdministracao: '',
  fundoReserva: 0,
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  return moneyFormatter.format(toNumber(value));
}

function formatPercent(value) {
  return `${percentFormatter.format(toNumber(value))}%`;
}

function calcPercent(part, total) {
  const totalNumber = toNumber(total);
  if (!totalNumber) return 0;
  return (toNumber(part) / totalNumber) * 100;
}

function displayText(value, fallback = '—') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function getTodayPlaceholder() {
  return new Intl.DateTimeFormat('pt-BR').format(new Date());
}

function loadData() {
  try {
    OLD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultData;
    return { ...defaultData, ...JSON.parse(saved) };
  } catch {
    return defaultData;
  }
}

function EditableField({ label, type = 'text', value, onChange, placeholder = '', min = 0, step = 'any' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        step={step}
        onChange={(e) => onChange(type === 'number' ? e.target.value : e.target.value)}
      />
    </label>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <div className="info-card-body">{children}</div>
    </div>
  );
}

function BrandHeader({ data }) {
  return (
    <header className="top">
      <div className="brand-block">
        <div className="brand-badge">
          <div className="brand-badge-ring" />
          <img className="brand-logo" src={vibraLogo} alt="Vibra Soluções" />
        </div>
        <div className="brand-copy">
          <p className="eyebrow">Vibra Soluções</p>
          <h1>Simulação personalizada</h1>
        </div>
      </div>

      <div className="top-info">
        <p className="admin">Administradora: <strong>{displayText(data.administradora)}</strong></p>
        <p className="validade">Plano exclusivo válido até: <strong>{displayText(data.validade)}</strong></p>
        <p className="subtitulo">{displayText(data.subtitulo, '')}</p>
      </div>
    </header>
  );
}

function Decor() {
  return (
    <>
      <div className="sheet-accent" />
      <div className="brand-orb orb-one" />
      <div className="brand-orb orb-two" />
      <img className="logo-watermark" src={vibraLogo} alt="" aria-hidden="true" />
    </>
  );
}

function DesktopPreview({ data, exportRef, derived, variant = 'screen' }) {
  return (
    <section className={`sheet sheet-${variant}`} ref={exportRef}>
      <Decor />
      <BrandHeader data={data} />

      <main className="columns">
        <article className="col">
          <h2>COMPOSIÇÃO<br />DO CRÉDITO</h2>

          <div className="item">
            <span>Crédito contratado</span>
            <strong>{formatMoney(data.creditoContratado)}</strong>
          </div>

          <div className="item">
            <span>Prazo de pagamento</span>
            <strong>{toNumber(data.prazoPagamento)} meses</strong>
          </div>

          <div className="item">
            <span>Parcelas até a contemplação</span>
            <strong>{formatMoney(data.parcelasAteContemplacao)}</strong>
          </div>
        </article>

        <div className="divider"><i>›</i></div>

        <article className="col">
          <h2>CÁLCULO<br />DO LANCE</h2>

          <div className="item compact-item">
            <span>Lance embutido</span>
            <strong>{formatMoney(data.lanceEmbutido)} / {formatPercent(derived.percentEmbutido)}</strong>
          </div>

          <div className="item compact-item">
            <span>Lance com recursos próprios</span>
            <strong>{formatMoney(data.lanceRecursos)} / {formatPercent(derived.percentRecursos)}</strong>
          </div>

          <div className="item compact-item">
            <span>Lance total em percentual</span>
            <strong>{formatPercent(derived.percentTotal)}</strong>
          </div>

          <div className="item final-item">
            <span>Crédito liberado</span>
            <strong>{formatMoney(derived.creditoLiberado)}</strong>
          </div>
        </article>

        <div className="divider"><i>›</i></div>

        <article className="col">
          <h2>SALDO DEVEDOR</h2>

          <div className="item compact-item">
            <span>Saldo após contemplação</span>
            <strong>{formatMoney(derived.saldoApos)}</strong>
          </div>

          <div className="item compact-item">
            <span>Prazo restante</span>
            <strong>{toNumber(data.prazoRestante)} meses</strong>
          </div>

          <div className="item compact-item">
            <span>Parcela após contemplação</span>
            <strong>{formatMoney(data.parcelaApos)}</strong>
          </div>

          <div className="item compact-item">
            <span>Taxa de administração</span>
            <strong>{displayText(data.taxaAdministracao)}</strong>
          </div>

          <div className="item compact-item">
            <span>Fundo de reserva</span>
            <strong>{formatPercent(data.fundoReserva)}</strong>
          </div>
        </article>
      </main>
    </section>
  );
}

function MobileCard({ title, children }) {
  return (
    <article className="mobile-card">
      <h2>{title}</h2>
      <div className="mobile-card-grid">{children}</div>
    </article>
  );
}

function MobileItem({ label, value }) {
  return (
    <div className="mobile-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MobilePreview({ data, exportRef, derived }) {
  return (
    <section className="mobile-sheet" ref={exportRef}>
      <Decor />
      <header className="mobile-top">
        <div className="mobile-logo-wrap">
          <img src={vibraLogo} alt="Vibra Soluções" />
        </div>
        <p className="mobile-eyebrow">Vibra Soluções</p>
        <h1>Simulação personalizada</h1>
        <div className="mobile-info">
          <p>Administradora: <strong>{displayText(data.administradora)}</strong></p>
          <p>Plano válido até: <strong>{displayText(data.validade)}</strong></p>
          {String(data.subtitulo || '').trim() ? <p>{data.subtitulo}</p> : null}
        </div>
      </header>

      <main className="mobile-content">
        <MobileCard title="Composição do crédito">
          <MobileItem label="Crédito contratado" value={formatMoney(data.creditoContratado)} />
          <MobileItem label="Prazo de pagamento" value={`${toNumber(data.prazoPagamento)} meses`} />
          <MobileItem label="Parcelas até contemplação" value={formatMoney(data.parcelasAteContemplacao)} />
        </MobileCard>

        <MobileCard title="Cálculo do lance">
          <MobileItem label="Lance embutido" value={`${formatMoney(data.lanceEmbutido)} / ${formatPercent(derived.percentEmbutido)}`} />
          <MobileItem label="Recursos próprios" value={`${formatMoney(data.lanceRecursos)} / ${formatPercent(derived.percentRecursos)}`} />
          <MobileItem label="Lance total" value={formatPercent(derived.percentTotal)} />
          <MobileItem label="Crédito liberado" value={formatMoney(derived.creditoLiberado)} />
        </MobileCard>

        <MobileCard title="Saldo devedor">
          <MobileItem label="Saldo após contemplação" value={formatMoney(derived.saldoApos)} />
          <MobileItem label="Prazo restante" value={`${toNumber(data.prazoRestante)} meses`} />
          <MobileItem label="Parcela após contemplação" value={formatMoney(data.parcelaApos)} />
          <MobileItem label="Taxa de administração" value={displayText(data.taxaAdministracao)} />
          <MobileItem label="Fundo de reserva" value={formatPercent(data.fundoReserva)} />
        </MobileCard>
      </main>
    </section>
  );
}


function MobileLivePreview({ data, derived }) {
  return (
    <section className="mobile-live-shell">
      <div className="mobile-live-frame">
        <div className="mobile-live-notch" />
        <div className="mobile-live-sheet">
          <Decor />
          <header className="mobile-live-top">
            <div className="mobile-live-logo">
              <img src={vibraLogo} alt="Vibra Soluções" />
            </div>
            <p>Vibra Soluções</p>
            <h1>Simulação personalizada</h1>
            <div className="mobile-live-info">
              <span>Administradora: <strong>{displayText(data.administradora)}</strong></span>
              <span>Validade: <strong>{displayText(data.validade)}</strong></span>
              {String(data.subtitulo || '').trim() ? <span>{data.subtitulo}</span> : null}
            </div>
          </header>

          <main className="mobile-live-content">
            <article className="mobile-live-card">
              <h2>Composição do crédito</h2>
              <div><span>Crédito contratado</span><strong>{formatMoney(data.creditoContratado)}</strong></div>
              <div><span>Prazo de pagamento</span><strong>{toNumber(data.prazoPagamento)} meses</strong></div>
              <div><span>Parcelas até contemplação</span><strong>{formatMoney(data.parcelasAteContemplacao)}</strong></div>
            </article>

            <article className="mobile-live-card">
              <h2>Cálculo do lance</h2>
              <div><span>Lance embutido</span><strong>{formatMoney(data.lanceEmbutido)} / {formatPercent(derived.percentEmbutido)}</strong></div>
              <div><span>Recursos próprios</span><strong>{formatMoney(data.lanceRecursos)} / {formatPercent(derived.percentRecursos)}</strong></div>
              <div><span>Lance total</span><strong>{formatPercent(derived.percentTotal)}</strong></div>
              <div><span>Crédito liberado</span><strong>{formatMoney(derived.creditoLiberado)}</strong></div>
            </article>

            <article className="mobile-live-card">
              <h2>Saldo devedor</h2>
              <div><span>Saldo após contemplação</span><strong>{formatMoney(derived.saldoApos)}</strong></div>
              <div><span>Prazo restante</span><strong>{toNumber(data.prazoRestante)} meses</strong></div>
              <div><span>Parcela após contemplação</span><strong>{formatMoney(data.parcelaApos)}</strong></div>
              <div><span>Taxa de administração</span><strong>{displayText(data.taxaAdministracao)}</strong></div>
              <div><span>Fundo de reserva</span><strong>{formatPercent(data.fundoReserva)}</strong></div>
            </article>
          </main>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [data, setData] = useState(loadData);
  const screenRef = useRef(null);
  const previewWrapRef = useRef(null);
  const desktopRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(0.88);
  const todayPlaceholder = useMemo(() => getTodayPlaceholder(), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useLayoutEffect(() => {
    const updatePreviewScale = () => {
      const wrap = previewWrapRef.current;
      if (!wrap) return;

      const availableWidth = Math.max(wrap.clientWidth - 18, 320);
      const availableHeight = Math.max(wrap.clientHeight - 18, 220);

      const scaleByWidth = availableWidth / 1206;
      const scaleByHeight = availableHeight / 676;
      const nextScale = Math.max(0.35, Math.min(0.90, scaleByWidth, scaleByHeight));

      setPreviewScale(Number(nextScale.toFixed(3)));
    };

    updatePreviewScale();

    const resizeObserver = new ResizeObserver(updatePreviewScale);
    if (previewWrapRef.current) resizeObserver.observe(previewWrapRef.current);
    window.addEventListener('resize', updatePreviewScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePreviewScale);
    };
  }, []);

  const set = (key, value) => setData((prev) => ({
    ...prev,
    [key]: typeof prev[key] === 'number' ? toNumber(value) : value,
  }));

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
  };

  const derived = useMemo(() => {
    const credito = toNumber(data.creditoContratado);
    const embutido = toNumber(data.lanceEmbutido);
    const recursos = toNumber(data.lanceRecursos);
    const prazoRestante = toNumber(data.prazoRestante);
    const parcelaApos = toNumber(data.parcelaApos);

    return {
      percentEmbutido: calcPercent(embutido, credito),
      percentRecursos: calcPercent(recursos, credito),
      percentTotal: calcPercent(embutido + recursos, credito),
      creditoLiberado: Math.max(credito - embutido, 0),
      saldoApos: parcelaApos * prazoRestante,
    };
  }, [data]);

  const exportFromRef = async (targetRef, filename, type = 'png') => {
    if (!targetRef.current) return;

    const canvas = await html2canvas(targetRef.current, {
      scale: 2,
      backgroundColor: '#eef3f8',
      useCORS: true,
      logging: false,
      windowWidth: targetRef.current.offsetWidth,
      windowHeight: targetRef.current.offsetHeight,
    });

    const link = document.createElement('a');
    link.download = `${filename}.${type}`;
    link.href = canvas.toDataURL(type === 'jpg' ? 'image/jpeg' : 'image/png', 0.98);
    link.click();
  };

  return (
    <div className="app">
      <aside className="panel">
        <div className="panel-head">
          <h2>Editor da simulação Vibra</h2>
          <p>Crie uma apresentação clara, visual e personalizada para demonstrar ao cliente as melhores condições da proposta.</p>
        </div>

        <InfoCard title="Informações gerais">
          <div className="grid two-columns">
            <EditableField label="Administradora" value={data.administradora} onChange={(v) => set('administradora', v)} placeholder="Ex.: Porto" />
            <EditableField label="Validade" value={data.validade} onChange={(v) => set('validade', v)} placeholder={todayPlaceholder} />
          </div>
          <EditableField label="Subtítulo" value={data.subtitulo} onChange={(v) => set('subtitulo', v)} />
        </InfoCard>

        <InfoCard title="Valores editáveis">
          <div className="grid two-columns">
            <EditableField label="Crédito contratado (R$)" type="number" value={data.creditoContratado} onChange={(v) => set('creditoContratado', v)} />
            <EditableField label="Prazo de pagamento (meses)" type="number" value={data.prazoPagamento} onChange={(v) => set('prazoPagamento', v)} />
            <EditableField label="Parcelas até contemplação (R$)" type="number" value={data.parcelasAteContemplacao} onChange={(v) => set('parcelasAteContemplacao', v)} />
            <EditableField label="Lance embutido (R$)" type="number" value={data.lanceEmbutido} onChange={(v) => set('lanceEmbutido', v)} />
            <EditableField label="Recursos próprios (R$)" type="number" value={data.lanceRecursos} onChange={(v) => set('lanceRecursos', v)} />
            <EditableField label="Prazo restante (meses)" type="number" value={data.prazoRestante} onChange={(v) => set('prazoRestante', v)} />
            <EditableField label="Parcela após contemplação (R$)" type="number" value={data.parcelaApos} onChange={(v) => set('parcelaApos', v)} />
            <EditableField label="Fundo de reserva (%)" type="number" value={data.fundoReserva} onChange={(v) => set('fundoReserva', v)} />
          </div>
          <EditableField label="Taxa de administração" value={data.taxaAdministracao} onChange={(v) => set('taxaAdministracao', v)} placeholder="Ex.: 0,4% a.m" />
        </InfoCard>

        <InfoCard title="Cálculos automáticos">
          <div className="summary-grid">
            <div className="summary-row"><span>% Lance embutido</span><strong>{formatPercent(derived.percentEmbutido)}</strong></div>
            <div className="summary-row"><span>% Recursos próprios</span><strong>{formatPercent(derived.percentRecursos)}</strong></div>
            <div className="summary-row"><span>% Lance total</span><strong>{formatPercent(derived.percentTotal)}</strong></div>
            <div className="summary-row"><span>Crédito liberado</span><strong>{formatMoney(derived.creditoLiberado)}</strong></div>
            <div className="summary-row"><span>Saldo após contemplação</span><strong>{formatMoney(derived.saldoApos)}</strong></div>
          </div>
        </InfoCard>

        <InfoCard title="Exportação">
          <div className="export-buttons">
            <button className="primary" onClick={() => exportFromRef(desktopRef, 'simulacao-vibra', 'png')}>
              <Download size={17} /> Exportar PNG
            </button>
          </div>
          <p className="export-note">A exportação gera a imagem em PNG no layout padrão de PC / Notebook.</p>
        </InfoCard>

        <div className="buttons">
          <button onClick={handleResetAll}><Eraser size={17} /> Limpar tudo</button>
          <button onClick={() => setData(defaultData)}><RotateCcw size={17} /> Resetar tela</button>
        </div>

        <p className="hint"><Save size={14} /> Os dados ficam salvos no navegador enquanto você edita.</p>
      </aside>

      <section
        className="preview-wrap"
        ref={previewWrapRef}
        style={{ '--preview-scale': previewScale }}
      >
        <div className="preview-stage">
          <DesktopPreview data={data} exportRef={screenRef} derived={derived} variant="screen" />
        </div>

        <MobileLivePreview data={data} derived={derived} />
      </section>

      <div className="export-host" aria-hidden="true">
        <DesktopPreview data={data} exportRef={desktopRef} derived={derived} variant="desktop" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
