'use client';

import { useState, useEffect } from 'react';

export default function ArtifactGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      number: '01',
      title: '複製 Published Artifact 網址',
      description: '從分享的連結中複製完整網址',
      url: 'https://claude.ai/public/artifacts/d3d0a572-593e-454a-b67b-a7501ae9b501',
      shortUrl: 'claude.ai/public/artifacts/d3d0a572-...',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.818-1.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757" />
        </svg>
      ),
    },
    {
      number: '02',
      title: '前往 Claude.ai 登入',
      description: '登入或註冊您的帳號',
      link: 'https://claude.ai',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: '在瀏覽器網址列貼上網址',
      description: '確保在同一瀏覽器、同一 Session',
      highlight: '重要提示',
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: '"Noto Sans TC", "SF Pro Display", -apple-system, sans-serif',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow effects */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          animation: 'fadeInDown 0.8s ease-out',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '100px',
            padding: '8px 20px',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}>快速指南</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #f9a8d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            啟用 7H+SEL 教案設計
          </h1>

          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            只需三個步驟，即可體驗完整的互動功能
          </p>
        </div>

        {/* Steps Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          position: 'relative',
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{
              position: 'relative',
              animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
            }}>
              {/* Step Card */}
              <div style={{
                background: activeStep >= index
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: activeStep >= index
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                padding: '28px 32px',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeStep >= index ? 'scale(1)' : 'scale(0.98)',
                opacity: activeStep >= index ? 1 : 0.5,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                }}>
                  {/* Icon Circle */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: activeStep >= index
                      ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activeStep >= index ? '#fff' : 'rgba(255,255,255,0.3)',
                    flexShrink: 0,
                    transition: 'all 0.5s ease',
                    boxShadow: activeStep >= index
                      ? '0 8px 32px rgba(99, 102, 241, 0.3)'
                      : 'none',
                  }}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                    }}>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: '"JetBrains Mono", monospace',
                      }}>STEP {step.number}</span>
                      {step.highlight && (
                        <span style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          color: '#fbbf24',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                        }}>{step.highlight}</span>
                      )}
                    </div>

                    <h3 style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '6px',
                    }}>{step.title}</h3>

                    <p style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '14px',
                      marginBottom: (step.url || step.link) ? '16px' : '0',
                      lineHeight: '1.5',
                    }}>{step.description}</p>

                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          borderRadius: '12px',
                          padding: '14px 24px',
                          cursor: 'pointer',
                          border: 'none',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
                        }}
                      >
                        <span style={{
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}>前往 Claude.ai</span>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="#fff"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}

                    {step.url && (
                      <div
                        onClick={() => handleCopy(step.url)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                      >
                        <code style={{
                          color: '#a5b4fc',
                          fontSize: '13px',
                          fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{step.shortUrl || step.url}</code>
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '16px 0',
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: activeStep > index ? 1 : 0.3,
                    transition: 'opacity 0.5s ease',
                  }}>
                    <div style={{
                      width: '2px',
                      height: '20px',
                      background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.5), rgba(236, 72, 153, 0.5))',
                      borderRadius: '2px',
                    }} />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4v16m0 0l-6-6m6 6l6-6"
                        stroke="url(#arrowGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="arrowGradient" x1="12" y1="4" x2="12" y2="20">
                          <stop stopColor="#6366f1" />
                          <stop offset="1" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Success Card */}
          <div style={{
            marginTop: '20px',
            animation: `fadeInUp 0.6s ease-out 0.6s both`,
          }}>
            <div style={{
              background: activeStep >= 3
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.08) 100%)'
                : 'rgba(255, 255, 255, 0.02)',
              border: activeStep >= 3
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: activeStep >= 3 ? 'scale(1)' : 'scale(0.98)',
              opacity: activeStep >= 3 ? 1 : 0.5,
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: activeStep >= 3
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: activeStep >= 3
                  ? '0 12px 40px rgba(16, 185, 129, 0.4)'
                  : 'none',
                transition: 'all 0.5s ease',
              }}>
                <svg
                  width="36"
                  height="36"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={activeStep >= 3 ? '#fff' : 'rgba(255,255,255,0.3)'}
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: activeStep >= 3 ? '#34d399' : 'rgba(255,255,255,0.3)',
                marginBottom: '8px',
                transition: 'color 0.5s ease',
              }}>成功！</h3>

              <p style={{
                color: activeStep >= 3 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255,255,255,0.3)',
                fontSize: '15px',
                transition: 'color 0.5s ease',
              }}>AI 功能現已可正常使用</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          animation: 'fadeIn 0.8s ease-out 1s both',
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.35)',
            fontSize: '13px',
            lineHeight: '1.7',
          }}>
            提示：請使用相同瀏覽器完成所有步驟
            <br />
            確保 Session 保持一致以獲得最佳體驗
          </p>
        </div>
      </div>

      {/* Toast notification */}
      {copied && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
          zIndex: 100,
        }}>
          已複製到剪貼簿
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
