"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Wifi, Code2, Zap, LayoutDashboard, Terminal, Github, Globe } from "lucide-react";
import Link from "next/link";

type Lang = 'en' | 'th';

const content = {
  en: {
    tagline: "v1.0.0 Stable Release",
    heroTitle1: "Hardware Code",
    heroTitle2: "Reimagined.",
    heroDesc: "Generate production-ready Arduino/ESP32 firmware in seconds. Visual configuration, automated dependency management, and instant telemetry.",
    btnLaunch: "Launch App",
    btnLearn: "Learn More",
    features: {
      visual: {
        title: "Visual Configurator",
        desc: "Drag, drop, and configure sensors visually. No more pin conflict headaches."
      },
      auto: {
        title: "Auto-Code Gen",
        desc: "Instantly generates clean, commented C++ firmware ready for PlatformIO or Arduino IDE."
      },
      broker: {
        title: "Private Broker",
        desc: "Includes a built-in secure MQTT broker for instant, zero-setup local communication."
      },
      libs: {
        title: "Smart Libraries",
        desc: "Automatically detects and lists only the libraries you actually need."
      }
    },
    footer: "© 2026 GhostMicro. Built for the Future."
  },
  th: {
    tagline: "เวอร์ชัน 1.0.0 พร้อมใช้งาน",
    heroTitle1: "ปฏิวัติการเขียนโค้ด",
    heroTitle2: "สำหรับฮาร์ดแวร์",
    heroDesc: "สร้างเฟิร์มแวร์ Arduino/ESP32 พร้อมใช้งานจริงในไม่กี่วินาที ตั้งค่าด้วยภาพ, จัดการไลบรารีอัตโนมัติ และดูค่าเซนเซอร์ได้ทันที",
    btnLaunch: "เริ่มใช้งาน",
    btnLearn: "เรียนรู้เพิ่มเติม",
    features: {
      visual: {
        title: "ตั้งค่าด้วยภาพ",
        desc: "ลากวางและตั้งค่าเซนเซอร์ผ่านหน้าจอ ลดความผิดพลาดและตัดปัญหาเรื่อง Pin ชนกันได้ถาวร"
      },
      auto: {
        title: "สร้างโค้ดอัตโนมัติ",
        desc: "Generate โค้ด C++ คุณภาพสูง พร้อมคอมเมนต์ละเอียด นำไปใช้กับ PlatformIO หรือ Arduino IDE ได้ทันที"
      },
      broker: {
        title: "Private Broker",
        desc: "มี MQTT Broker ในตัว ช่วยให้สามารถสื่อสารข้อมูลในเครือข่ายภายในได้ทันที โดยไม่ต้องตั้งค่า Server เพิ่มเติม"
      },
      libs: {
        title: "จัดการไลบรารีอัจฉริยะ",
        desc: "ระบบจะคำนวณและเลือกเฉพาะไลบรารีที่จำเป็นต้องใช้สำหรับการตั้งค่าของคุณให้อัตโนมัติ"
      }
    },
    footer: "© 2026 GhostMicro. สร้างสรรค์เพื่ออนาคต (Built for the Future)."
  }
};

export default function Home() {
  const [lang, setLang] = useState<Lang>('th');
  const t = content[lang];

  return (
    <div className="flex min-h-screen flex-col font-sans text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400" size={24} />
            <span className="font-bold text-lg tracking-tight">GhostMicro <span className="text-white/40 font-normal">IoT</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(l => l === 'en' ? 'th' : 'en')}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <Globe size={16} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-bold text-white uppercase w-4 text-center">{lang}</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <Link href="https://github.com/GhostMicro" className="text-white/60 hover:text-white transition-colors">
              <Github size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black -z-10" />

          <div className="container mx-auto text-center max-w-4xl">
            <motion.div
              key={lang} // Helper to re-animate on lang change
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-medium mb-6">
                {t.tagline}
              </span>
              <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-tight md:leading-tight">
                {t.heroTitle1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 pb-2 inline-block">
                  {t.heroTitle2}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                {t.heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/generate"
                  className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <Zap size={18} fill="currentColor" /> {t.btnLaunch}
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  {t.btnLearn}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<LayoutDashboard size={24} className="text-cyan-400" />}
                title={t.features.visual.title}
                desc={t.features.visual.desc}
              />
              <FeatureCard
                icon={<Code2 size={24} className="text-purple-400" />}
                title={t.features.auto.title}
                desc={t.features.auto.desc}
              />
              <FeatureCard
                icon={<Wifi size={24} className="text-green-400" />}
                title={t.features.broker.title}
                desc={t.features.broker.desc}
              />
              <FeatureCard
                icon={<Terminal size={24} className="text-yellow-400" />}
                title={t.features.libs.title}
                desc={t.features.libs.desc}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 py-8 text-center text-white/30 text-sm">
        <div className="container mx-auto">
          <p>{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
      <div className="mb-4 p-3 bg-black/40 rounded-lg w-fit group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-white/50 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}
