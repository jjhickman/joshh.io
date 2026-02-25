import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';

export default function Blog() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Blog</h1>
          <p className="mt-2 text-text-light-muted dark:text-text-dark-muted">
            Thoughts on software, architecture, and the things in between.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center">
          <p className="text-text-light-muted dark:text-text-dark-muted">
            Posts coming soon. Check back later.
          </p>
        </div>
      </motion.div>
    </Section>
  );
}
