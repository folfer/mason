import { ImageResponse } from 'next/og'

export const alt = 'Mason Daily — O Jornal da Maçonaria'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at 50% 35%, rgba(198,161,91,0.18) 0%, rgba(8,8,6,0) 55%), #080806',
          color: '#F7F1E5',
          fontFamily: 'serif',
          padding: 80,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 56,
          }}
        >
          <svg
            width="88"
            height="88"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C6A15B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: 2,
              display: 'flex',
              gap: 12,
            }}
          >
            <span style={{ color: '#F7F1E5' }}>Mason</span>
            <span style={{ color: '#C6A15B', fontWeight: 700 }}>Daily</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 980,
            color: '#F7F1E5',
          }}
        >
          O Jornal da Maçonaria
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 30,
            color: '#B8AE9A',
            textAlign: 'center',
            maxWidth: 880,
            lineHeight: 1.4,
            fontFamily: 'sans-serif',
          }}
        >
          Conhecimento maçônico curado por grau — de irmão para irmão.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#C6A15B',
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          <span>—</span>
          <span>coluna.oriente.news</span>
          <span>—</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
