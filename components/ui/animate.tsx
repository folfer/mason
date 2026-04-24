'use client'

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

interface AnimateProps extends HTMLMotionProps<'div'> {
  delay?: number
  className?: string
  children: React.ReactNode
}

export function FadeUp({ delay = 0, className, children, ...props }: AnimateProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUpVariants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ delay = 0, className, children, ...props }: AnimateProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeInVariants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ delay = 0, className, children, ...props }: AnimateProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={scaleInVariants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ className, children, ...props }: Omit<AnimateProps, 'delay'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ className, children, ...props }: Omit<AnimateProps, 'delay'>) {
  return (
    <motion.div variants={fadeUpVariants} className={className} {...props}>
      {children}
    </motion.div>
  )
}
