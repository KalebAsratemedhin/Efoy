import DoctorsList from "../doctors/DoctorsList";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Stethoscope, CalendarCheck, Shield } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };
const stagger = (i: number) => ({ transition: { delay: i * 0.1 } });

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-ink font-sans antialiased">
      {/* Hero — white background */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(8,145,178,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              className="lg:col-span-7 space-y-8"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-ink">
                Your health.
                <br />
                <span className="text-accent">Our priority.</span>
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl max-w-xl leading-relaxed">
                Book appointments, connect with doctors over video, and manage your care from anywhere. Simple, secure, human.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent-hover transition-colors"
                  >
                    Get started
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/doctors"
                    className="inline-flex items-center gap-2 border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-accent hover:text-accent transition-colors"
                  >
                    Find doctors
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-lg">
                <img
                  src="/docs-cartoon.jpeg"
                  alt="Healthcare"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats — minimal strip */}
      <section className="relative py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Expert doctors" },
              { value: "10k+", label: "Patients helped" },
              { value: "100%", label: "Video ready" },
              { value: "15+", label: "Specialties" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="text-center"
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-accent">{item.value}</div>
                <div className="text-slate-500 text-sm mt-1 uppercase tracking-wider">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — cards with icons */}
      <section className="py-24 lg:py-32 relative bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4">What we offer</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              One place for appointments, video visits, and your health story.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, title: "Expert doctors", desc: "Qualified professionals across specialties." },
              { icon: CalendarCheck, title: "Easy scheduling", desc: "Book, reschedule, or cancel in a few clicks." },
              { icon: Heart, title: "Care when it matters", desc: "Support that fits your life." },
              { icon: Shield, title: "Video consultations", desc: "Secure, high-quality video calls from home." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hover:border-accent/40 hover:shadow-md transition-colors"
                {...fadeUp}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors" {...stagger(i)}>
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured doctors */}
      <section className="py-24 lg:py-32 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-12" {...fadeUp}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2">Meet our doctors</h2>
            <p className="text-slate-600">Browse and book with verified specialists.</p>
          </motion.div>
          <div className="overflow-x-auto">
            <DoctorsList embedded />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-white border-t border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(8,145,178,0.06),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ink mb-6">
              Ready to take control of your health?
            </h2>
            <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands who use Efoy for appointments and video consultations. No hassle, just care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent-hover transition-colors"
                >
                  Get started now
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-accent hover:text-accent transition-colors"
                >
                  Contact us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
