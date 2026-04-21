'use client';

import { ReagenteEntrada, Reagente } from '@prisma/client';
import Image from 'next/image';
import { useRef } from 'react';

interface EtiquetaProps {
  entrada: ReagenteEntrada & { reagente?: Reagente };
  logoUrl?: string;
}

export default function EtiquetaReagente({ entrada, logoUrl }: EtiquetaProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const element = printRef.current;
    if (!element) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(
      `<html><head><title>Etiqueta - ${entrada.reagente?.nome}</title>` +
      `<style>` +
      `body { font-family: Arial, sans-serif; margin: 0; padding: 20px; } ` +
      `.etiqueta { border: 2px solid #2c3e50; padding: 20px; width: 600px; background: white; page-break-after: always; } ` +
      `</style>` +
      `</head><body>` +
      element.innerHTML +
      `</body></html>`
    );
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 800, 1000);

    // Border
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 780, 980);

    // Dados para desenhar
    const data = [
      entrada.reagente?.nome || 'Reagente',
      `Código: ${entrada.codigoInterno}`,
      entrada.categoria ? `Categoria: ${entrada.categoria}` : '',
      entrada.concentracao ? `Concentração: ${entrada.concentracao}` : '',
      entrada.localizacao
        ? `📍 Localização: ${entrada.localizacao}`
        : '',
      entrada.dataValidade
        ? `Validade: ${new Date(entrada.dataValidade).toLocaleDateString('pt-BR')}`
        : '',
      entrada.responsavel ? `Responsável: ${entrada.responsavel}` : '',
      entrada.perigos ? `⚠️ ${entrada.perigos}` : '',
    ].filter(Boolean);

    // Desenhar textos
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(data[0], 40, 80);

    ctx.font = '14px Arial';
    let y = 120;
    for (const line of data.slice(1)) {
      ctx.fillText(line, 40, y);
      y += 40;
    }

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiqueta-${entrada.codigoInterno}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const dataValidadeFormatada = entrada.dataValidade
    ? new Date(entrada.dataValidade).toLocaleDateString('pt-BR')
    : '-';

  return (
    <div className="space-y-4">
      <div
        ref={printRef}
        style={{
          width: '210mm',
          height: '297mm',
          border: '2px solid #2c3e50',
          padding: '20px',
          backgroundColor: 'white',
          fontFamily: 'Arial, sans-serif',
          pageBreakAfter: 'always',
        }}
      >
        {/* Header com Logo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #ecf0f1',
          }}
        >
          {logoUrl && (
            <div style={{ width: '80px', height: '80px', position: 'relative' }}>
              <Image
                src={logoUrl}
                alt="LERP Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2
              style={{
                margin: '0',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
              }}
            >
              {entrada.reagente?.nome}
            </h2>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '12px',
                color: '#7f8c8d',
              }}
            >
              LERP - Laboratório de Engenharia de Reações Poliméricas
            </p>
          </div>
        </div>

        {/* Código e Informações Principais */}
        <div
          style={{
            backgroundColor: '#ecf0f1',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '11px',
                  color: '#7f8c8d',
                  fontWeight: 'bold',
                }}
              >
                CÓDIGO INTERNO:
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  fontFamily: 'monospace',
                }}
              >
                {entrada.codigoInterno}
              </p>
            </div>
            {entrada.concentracao && (
              <div>
                <p
                  style={{
                    margin: '0 0 5px 0',
                    fontSize: '11px',
                    color: '#7f8c8d',
                    fontWeight: 'bold',
                  }}
                >
                  CONCENTRAÇÃO:
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                  }}
                >
                  {entrada.concentracao}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detalhes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          {entrada.categoria && (
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '11px',
                  color: '#7f8c8d',
                  fontWeight: 'bold',
                }}
              >
                CATEGORIA:
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50' }}>
                {entrada.categoria}
              </p>
            </div>
          )}
          {entrada.localizacao && (
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '11px',
                  color: '#7f8c8d',
                  fontWeight: 'bold',
                }}
              >
                📍 LOCALIZAÇÃO:
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50' }}>
                {entrada.localizacao}
              </p>
            </div>
          )}
        </div>

        {/* Validade */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          {entrada.dataValidade && (
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '11px',
                  color: '#7f8c8d',
                  fontWeight: 'bold',
                }}
              >
                VALIDADE:
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50' }}>
                {dataValidadeFormatada}
              </p>
            </div>
          )}
          {entrada.responsavel && (
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '11px',
                  color: '#7f8c8d',
                  fontWeight: 'bold',
                }}
              >
                RESPONSÁVEL:
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50' }}>
                {entrada.responsavel}
              </p>
            </div>
          )}
        </div>

        {/* Avisos/Perigos */}
        {entrada.perigos && (
          <div
            style={{
              backgroundColor: '#ffe8e8',
              border: '2px solid #e74c3c',
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '20px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#c0392b',
              }}
            >
              ⚠️ {entrada.perigos}
            </p>
          </div>
        )}

        {/* Informações Adicionais */}
        <div
          style={{
            fontSize: '11px',
            color: '#95a5a6',
            borderTop: '1px solid #ecf0f1',
            paddingTop: '15px',
          }}
        >
          <p style={{ margin: '0 0 5px 0' }}>
            Entrada: {new Date(entrada.dataEntrada).toLocaleDateString('pt-BR')}
          </p>
          {entrada.fornecedor && (
            <p style={{ margin: '0 0 5px 0' }}>Fornecedor: {entrada.fornecedor}</p>
          )}
          {entrada.notaFiscal && (
            <p style={{ margin: 0 }}>NF: {entrada.notaFiscal}</p>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨️ Imprimir
        </button>
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ⬇️ Download
        </button>
      </div>
    </div>
  );
}
