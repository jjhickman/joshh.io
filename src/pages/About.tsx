import { motion } from "framer-motion";
import { GraduationCap, MapPin } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ExperienceTimeline } from "@/components/shared/ExperienceTimeline";
import { SkillBadges } from "@/components/shared/SkillBadges";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function About() {
  return (
    <>
      <Section>
        <motion.div {...fadeIn} className="space-y-6">
          <h1 className="text-3xl font-bold sm:text-4xl">About</h1>
          <div className="space-y-4 text-text-light-muted dark:text-text-dark-muted leading-relaxed">
            <p>
              I&apos;m Josh, a Senior Software Engineer in Boston with over 8
              years of professional experience in software and advanced software
              systems. Before Liberty Mutual, I spent three years at Boston
              Dynamics on the Warehouse Robotics Interfaces team, building the
              web interface and backend services for the Stretch robot.
            </p>
            <p>
              My current work is enterprise, cloud-heavy, and high-volume. I
              design AWS services and shared platforms used by multiple teams,
              with daily focus on system design and the AWS Well-Architected
              Framework.
            </p>
            <p>
              Liberty Mutual&apos;s company profile reports $50.2B in annual
              consolidated revenue and 40,000+ employees across 28 countries and
              economies (as of December 31, 2024), so scale constraints are part
              of everyday engineering decisions.
            </p>
            <p>
              I started my career at SICK Sensor Intelligence in Stoughton, MA,
              building industrial microservices and package scanning systems. I
              graduated from the University of Tennessee, Knoxville with a B.S.
              in Computer Science in 2018, and have been based in the Boston
              area since graduating.
            </p>
            <p>
              Outside of work, I make music concepts, tinker with home lab
              infrastructure, and keep exploring AI and agent tooling with a
              practical engineering lens.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-text-light-muted dark:text-text-dark-muted">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-accent dark:text-amber-soft" />
              Boston, MA
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap
                size={14}
                className="text-accent dark:text-amber-soft"
              />
              B.S. Computer Science, University of Tennessee (2018)
            </span>
          </div>
        </motion.div>
      </Section>

      {/* Experience Timeline */}
      <Section className="bg-neutral-50 dark:bg-neutral-900/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-8 text-2xl font-bold">Experience</h2>
          <ExperienceTimeline items={experience} />
        </motion.div>
      </Section>

      {/* Skills */}
      <Section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-8 text-2xl font-bold">Skills</h2>
          <SkillBadges categories={skills} />
        </motion.div>
      </Section>
    </>
  );
}
