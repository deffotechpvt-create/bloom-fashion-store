import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <img
            src={heroImage}
            alt="Minimal fashion editorial"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block text-sm font-medium text-primary tracking-widest uppercase mb-6"
          >
            New Season
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-light text-foreground leading-tight mb-8"
          >
            Refined
            <br />
            <span className="font-semibold">Essentials</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-muted-foreground max-w-md mb-10"
          >
            Timeless pieces crafted with intention. Designed for those who appreciate understated elegance.
          </motion.p>

          <motion.a
            href="#shop"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ gap: '1rem' }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors group"
          >
            Explore Collection
            <motion.span
              className="transition-transform group-hover:translate-x-1"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </motion.a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ height: ['20%', '40%', '20%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 bg-foreground/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
