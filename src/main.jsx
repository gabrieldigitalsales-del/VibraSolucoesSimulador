import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { Download, RotateCcw, Save, Eraser } from 'lucide-react';
import vibraLogo from './assets/logo-vibra.png';
import './style.css';

const STORAGE_KEY = 'simulacao-vibra-solucoes-v3';
const OLD_STORAGE_KEYS = ['simulacao-vibra-solucoes', 'simulacao-vibra-solucoes-v2', 'simulacao-vibra'];

const visibilityDefaults = {
  creditoContratado: true,
  prazoPagamento: true,
  primeiraParcela: true,
  demaisParcelas: true,
  lanceEmbutido: true,
  lanceRecursos: true,
  lanceTotalPercentual: true,
  creditoLiberado: true,
  saldoApos: true,
  prazoRestante: true,
  parcelaApos: true,
  taxaAdministracao: true,
  fundoReserva: true,
};

const toggleOptions = [
  ['creditoContratado', 'Crédito contratado'],
  ['prazoPagamento', 'Prazo de pagamento'],
  ['primeiraParcela', 'Primeira parcela'],
  ['demaisParcelas', 'Demais parcelas'],
  ['lanceEmbutido', 'Lance embutido'],
  ['lanceRecursos', 'Recursos próprios'],
  ['lanceTotalPercentual', 'Lance total em percentual'],
  ['creditoLiberado', 'Crédito liberado'],
  ['saldoApos', 'Saldo após contemplação'],
  ['prazoRestante', 'Prazo restante'],
  ['parcelaApos', 'Parcela após contemplação'],
  ['taxaAdministracao', 'Taxa de administração'],
  ['fundoReserva', 'Fundo de reserva'],
];

const defaultData = {
  validade: '',
  administradora: '',
  subtitulo: '',
  creditoContratado: 0,
  prazoPagamento: 0,
  primeiraParcela: 0,
  demaisParcelas: 0,
  lanceEmbutido: 0,
  lanceRecursos: 0,
  creditoLiberado: 0,
  prazoRestante: 0,
  parcelaApos: 0,
  taxaAdministracao: '',
  fundoReserva: 0,
  visibleFields: { ...visibilityDefaults },
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

function getVisibleFields(data) {
  return { ...visibilityDefaults, ...(data?.visibleFields || {}) };
}

function loadData() {
  try {
    OLD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultData;
    const parsed = JSON.parse(saved);
    return {
      ...defaultData,
      ...parsed,
      visibleFields: { ...visibilityDefaults, ...(parsed?.visibleFields || {}) },
    };
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

function VisibilityToggle({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        border: '1px solid rgba(15, 23, 42, 0.12)',
        borderRadius: '12px',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '0.94rem',
        fontWeight: 600,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
      />
      <span>{label}</span>
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
  const visible = getVisibleFields(data);

  return (
    <section className={`sheet sheet-${variant}`} ref={exportRef}>
      <Decor />
      <BrandHeader data={data} />

      <main className="columns">
        <article className="col">
          <h2>COMPOSIÇÃO<br />DO CRÉDITO</h2>
          {visible.creditoContratado && <div className="item"><span>Crédito contratado</span><strong>{formatMoney(data.creditoContratado)}</strong></div>}
          {visible.prazoPagamento && <div className="item"><span>Prazo de pagamento</span><strong>{toNumber(data.prazoPagamento)} meses</strong></div>}
          {visible.primeiraParcela && <div className="item"><span>Primeira parcela</span><strong>{formatMoney(data.primeiraParcela)}</strong></div>}
          {visible.demaisParcelas && <div className="item"><span>Demais parcelas</span><strong>{formatMoney(data.demaisParcelas)}</strong></div>}
        </article>

        <div className="divider"><i>›</i></div>

        <article className="col">
          <h2>CÁLCULO<br />DO LANCE</h2>
          {visible.lanceEmbutido && <div className="item compact-item"><span>Lance embutido</span><strong>{formatMoney(data.lanceEmbutido)} / {formatPercent(derived.percentEmbutido)}</strong></div>}
          {visible.lanceRecursos && <div className="item compact-item"><span>Lance com recursos próprios</span><strong>{formatMoney(data.lanceRecursos)} / {formatPercent(derived.percentRecursos)}</strong></div>}
          {visible.lanceTotalPercentual && <div className="item compact-item"><span>Lance total em percentual</span><strong>{formatPercent(derived.percentTotal)}</strong></div>}
          {visible.creditoLiberado && <div className="item final-item"><span>Crédito liberado</span><strong>{formatMoney(data.creditoLiberado)}</strong></div>}
        </article>

        <div className="divider"><i>›</i></div>

        <article className="col">
          <h2>SALDO DEVEDOR</h2>
          {visible.saldoApos && <div className="item compact-item"><span>Saldo após contemplação</span><strong>{formatMoney(derived.saldoApos)}</strong></div>}
          {visible.prazoRestante && <div className="item compact-item"><span>Prazo restante</span><strong>{toNumber(data.prazoRestante)} meses</strong></div>}
          {visible.parcelaApos && <div className="item compact-item"><span>Parcela após contemplação</span><strong>{formatMoney(data.parcelaApos)}</strong></div>}
          {visible.taxaAdministracao && <div className="item compact-item"><span>Taxa de administração</span><strong>{displayText(data.taxaAdministracao)}</strong></div>}
          {visible.fundoReserva && <div className="item compact-item"><span>Fundo de reserva</span><strong>{formatPercent(data.fundoReserva)}</strong></div>}
        </article>
      </main>
    </section>
  );
}

function MobileLivePreview({ data, derived }) {
  const visible = getVisibleFields(data);

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
              {visible.creditoContratado && <div><span>Crédito contratado</span><strong>{formatMoney(data.creditoContratado)}</strong></div>}
              {visible.prazoPagamento && <div><span>Prazo de pagamento</span><strong>{toNumber(data.prazoPagamento)} meses</strong></div>}
              {visible.primeiraParcela && <div><span>Primeira parcela</span><strong>{formatMoney(data.primeiraParcela)}</strong></div>}
              {visible.demaisParcelas && <div><span>Demais parcelas</span><strong>{formatMoney(data.demaisParcelas)}</strong></div>}
            </article>

            <article className="mobile-live-card">
              <h2>Cálculo do lance</h2>
              {visible.lanceEmbutido && <div><span>Lance embutido</span><strong>{formatMoney(data.lanceEmbutido)} / {formatPercent(derived.percentEmbutido)}</strong></div>}
              {visible.lanceRecursos && <div><span>Recursos próprios</span><strong>{formatMoney(data.lanceRecursos)} / {formatPercent(derived.percentRecursos)}</strong></div>}
              {visible.lanceTotalPercentual && <div><span>Lance total</span><strong>{formatPercent(derived.percentTotal)}</strong></div>}
              {visible.creditoLiberado && <div><span>Crédito liberado</span><strong>{formatMoney(data.creditoLiberado)}</strong></div>}
            </article>

            <article className="mobile-live-card">
              <h2>Saldo devedor</h2>
              {visible.saldoApos && <div><span>Saldo após contemplação</span><strong>{formatMoney(derived.saldoApos)}</strong></div>}
              {visible.prazoRestante && <div><span>Prazo restante</span><strong>{toNumber(data.prazoRestante)} meses</strong></div>}
              {visible.parcelaApos && <div><span>Parcela após contemplação</span><strong>{formatMoney(data.parcelaApos)}</strong></div>}
              {visible.taxaAdministracao && <div><span>Taxa de administração</span><strong>{displayText(data.taxaAdministracao)}</strong></div>}
              {visible.fundoReserva && <div><span>Fundo de reserva</span><strong>{formatPercent(data.fundoReserva)}</strong></div>}
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
  const visibleFields = getVisibleFields(data);

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

  const setVisibility = (key, checked) => setData((prev) => ({
    ...prev,
    visibleFields: {
      ...visibilityDefaults,
      ...(prev.visibleFields || {}),
      [key]: checked,
    },
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
            <EditableField label="Primeira parcela (R$)" type="number" value={data.primeiraParcela} onChange={(v) => set('primeiraParcela', v)} />
            <EditableField label="Demais parcelas (R$)" type="number" value={data.demaisParcelas} onChange={(v) => set('demaisParcelas', v)} />
            <EditableField label="Lance embutido (R$)" type="number" value={data.lanceEmbutido} onChange={(v) => set('lanceEmbutido', v)} />
            <EditableField label="Recursos próprios (R$)" type="number" value={data.lanceRecursos} onChange={(v) => set('lanceRecursos', v)} />
            <EditableField label="Crédito liberado (R$)" type="number" value={data.creditoLiberado} onChange={(v) => set('creditoLiberado', v)} />
            <EditableField label="Prazo restante (meses)" type="number" value={data.prazoRestante} onChange={(v) => set('prazoRestante', v)} />
            <EditableField label="Parcela após contemplação (R$)" type="number" value={data.parcelaApos} onChange={(v) => set('parcelaApos', v)} />
            <EditableField label="Fundo de reserva (%)" type="number" value={data.fundoReserva} onChange={(v) => set('fundoReserva', v)} />
          </div>
          <EditableField label="Taxa de administração" value={data.taxaAdministracao} onChange={(v) => set('taxaAdministracao', v)} placeholder="Ex.: 0,4% a.m" />
        </InfoCard>

        <InfoCard title="Exibir / ocultar campos">
          <div className="grid two-columns">
            {toggleOptions.map(([key, label]) => (
              <VisibilityToggle
                key={key}
                label={label}
                checked={visibleFields[key] !== false}
                onChange={(checked) => setVisibility(key, checked)}
              />
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Cálculos automáticos">
          <div className="summary-grid">
            <div className="summary-row"><span>% Lance embutido</span><strong>{formatPercent(derived.percentEmbutido)}</strong></div>
            <div className="summary-row"><span>% Recursos próprios</span><strong>{formatPercent(derived.percentRecursos)}</strong></div>
            <div className="summary-row"><span>% Lance total</span><strong>{formatPercent(derived.percentTotal)}</strong></div>
            <div className="summary-row"><span>Crédito liberado</span><strong>{formatMoney(data.creditoLiberado)}</strong></div>
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

      <section className="preview-wrap" ref={previewWrapRef} style={{ '--preview-scale': previewScale }}>
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
