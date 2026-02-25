import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-light transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center">
          <p className="text-text-light-muted dark:text-text-dark-muted">
            Post &ldquo;{slug}&rdquo; not found. Blog posts coming soon.
          </p>
        </div>
      </motion.div>
    </Section>
  );
}
