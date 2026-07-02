import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>StudyPilot - 智能学习助手</title>
        <meta name="description" content="StudyPilot 智能学习助手，高效掌控学习进度" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '4rem', margin: '0', fontWeight: '700' }}>StudyPilot</h1>
        <p style={{ fontSize: '1.5rem', margin: '20px 0', opacity: '0.9' }}>
          智能学习助手
        </p>
        <p style={{ fontSize: '1.1rem', maxWidth: '500px', opacity: '0.75', lineHeight: '1.6' }}>
          高效掌控学习进度，规划学习路线，追踪学习成果
        </p>
        <div style={{
          marginTop: '40px',
          padding: '12px 32px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          fontSize: '1rem',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          🚀 即将上线
        </div>
      </main>
    </div>
  );
}
