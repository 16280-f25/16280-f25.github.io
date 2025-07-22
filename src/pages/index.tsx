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
          <strong>Intelligent Robotic Systems</strong>
        </Heading>
        <p className="hero__subtitle">16-280 Carnegie Mellon University, Fall 2025</p>
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
              This undergraduate course in programming for robotics covers essential topics for designing and implementing cognition algorithms for robotic systems. Students will learn about the design patterns and implementation of search, planning, perception, control, and deep neural networks for robotics. Additionally, the course covers software best practices, including the Robot Operating System (ROS), Linux administration, and embedded systems. Through hands-on programming assignments and projects, students will gain practical experience in implementing these algorithms on real robotic platforms. By the end of the course, students will have a strong foundation in programming for robotics and the ability to design and implement cognition algorithms for robotic systems using software best practices.
              </p>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col col--12">
            <div className="margin-vert--lg">
              <Heading as="h2">Course Staff</Heading>
              
              <div className="row">
                <div className="col col--6">
                  <Heading as="h3">Abhi Silwal</Heading>
                  <p>Instructor</p>
                  <p>Robotics Institute</p>
                  <p>Email: asilwal@andrew.cmu.edu</p>
                  <p>Office: LL050 Collaborative Innovation Center</p>
                </div>
              </div>
              
              <div className="row margin-top--md">
                <div className="col col--6">
                  <Heading as="h4">Julius Arolovitch</Heading>
                  <p>Head Teaching Assistant</p>
                  <p>Email: jarolovi@andrew.cmu.edu</p>

                  <Heading as="h4">Kacper Gasior</Heading>
                  <p>Teaching Assistant</p>
                  <p>Email: kgasior@andrew.cmu.edu</p>
                  
                </div>
                
                <div className="col col--6">
                <Heading as="h4">Abby DeFranco</Heading>
                  <p>Head Teaching Assistant</p>
                  <p>Email: amdefran@andrew.cmu.edu</p>
                  
                  <Heading as="h4">Alex Dietrich</Heading>
                  <p>Teaching Assistant</p>
                  <p>Email: ajdietri@andrew.cmu.edu</p>
                </div>
              </div>
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
      description="Course website for 16-280 Intelligent Robotic Systems">
      <HomepageHeader />
      <HomepageContent />
    </Layout>
  );
}
