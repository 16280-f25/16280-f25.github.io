import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <strong>16-280 Intelligent Robotic Systems</strong>
        </Heading>
        <p className="hero__subtitle">Carnegie Mellon University, Fall 2025</p>
      </div>
    </header>
  );
}

function HomepageContent() {
  return (
    <main>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <div className="margin-vert--lg">
              <Heading as="h1">Course Description</Heading>
              <p>
                This course provides a comprehensive introduction to intelligent robotic systems, 
                covering the fundamental principles and advanced techniques that enable robots to 
                perceive, reason, and act autonomously in complex environments. Students will explore 
                the intersection of artificial intelligence and robotics through both theoretical 
                foundations and hands-on implementation.
              </p>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col col--6">
            <div className="margin-vert--lg">
              <Heading as="h2">Instructor</Heading>
              <Heading as="h3">Abhi Silwal</Heading>
              <p>Robotics Institute</p>
              <p>Email: asilwal@andrew.cmu.edu</p>
              <p>Office: LL050 Collaborative Innovation Center</p>
            </div>
          </div>
          
          <div className="col col--6">
            <div className="margin-vert--lg">
              <Heading as="h2">Teaching Assistants</Heading>
              <Heading as="h4">Julius Arolovitch</Heading>
              <p>Email: jarolovi@andrew.cmu.edu</p>
              
              <Heading as="h4">Abby DeFranco</Heading>
              <p>Email: amdefran@andrew.cmu.edu</p>
              
              <Heading as="h4">Kacper Gasior</Heading>
              <p>Email: kgasior@andrew.cmu.edu</p>

              <Heading as="h4">Alex Dietrich</Heading>
              <p>Email: ajdietri@andrew.cmu.edu</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Course website for 16-280 Intelligent Robotic Systems - Exploring the intersection of AI and robotics">
      <HomepageHeader />
      <HomepageContent />
    </Layout>
  );
}
