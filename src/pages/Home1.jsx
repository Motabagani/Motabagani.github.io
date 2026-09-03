import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';

// All projects live in this array. To add a new one, just push another object.
// This is the React way: data drives the UI.

// Four hero variants — one shown at random on each page load
const heroVariants = [
  {
    h1: (
      <>
        Is this another boring portfolio?<br />
        <em>NO</em>
      </>
    ),
    lede: 'Have you ever met someone who does programming, economic models, and sometimes, political pieces?',
  },
  {
    h1: (
      <>
        Software, economics,<br />
        and the <em>occasional</em><br />
        political essay.
      </>
    ),
    lede: 'An NYU student building things across disciplines — Java systems, economic models, and writing that takes Aristotle seriously enough to bring him to Qatar.',
  },
  {
    h1: (
      <>
        Another boring portfolio?<br />
        <em>Decide for yourself.</em>
      </>
    ),
    lede: 'Programming, economic modeling, and political writing — by someone who refuses to pick just one.',
  },
  {
    h1: (
      <>
        Have you met someone who<br />
        writes <em>code</em>, <em>models</em>,<br />
        and <em>essays</em>?
      </>
    ),
     lede: (
    <>
      I'm Hashim, someone who loves working across software, economics, and <em>more</em>.
    </>
     )
  },
];

// Pick one at random — this runs once when the page loads
const hero = heroVariants[Math.floor(Math.random() * heroVariants.length)];
const projects = [
  {
    year: '2024',
    type: 'Code · CS 102',
    title: 'Course Registration System',
    description:
      'A Java OOP project simulating a university course registration platform — admin and student roles, course CRUD, enrollment, and .ser persistence. Group project for CS 102.',
    tags: ['Java', 'OOP', 'Serialization', 'CSV'],
    href: '#/projects/course-registration',
  },
  {
    year: '2025',
    type: 'Design',
    title: 'Project Two',
    description:
      'A visual identity, brand system, or design exploration. Describe what you made and the result it produced.',
    tags: ['Brand', 'Type'],
    href: '#',
  },
  {
    year: '2025',
    type: 'Writing',
    title: 'Project Three',
    description:
      'An essay, paper, or longer piece of writing. A line about the argument and where it appeared.',
    tags: ['Essay'],
    href: '#',
  },
  {
    year: '2024',
    type: 'Code',
    title: 'Project Four',
    description:
      'Another build worth showing — an open-source tool, a side project, a client engagement. Brief but specific.',
    tags: ['Python', 'ML'],
    href: '#',
  },
];

// Writing entries — also data-driven for easy editing.
const writing = [
  { date: '2026·04', title: 'On building things slowly, in public', read: '8 min' },
  { date: '2026·02', title: 'The case for the generalist, revisited', read: '12 min' },
  { date: '2025·11', title: 'Notes from a year of side projects', read: '6 min' },
  { date: '2025·08', title: 'What I learned shipping my first product', read: '10 min' },
];

function Home() {
  return (
    <>
      <TopBar />

      <main>
        {/* HERO */}
        <section className="hero container">
  <div className="eyebrow">Portfolio · Est. 2026</div>
  <h1>{hero.h1}</h1>
  <p className="lede">{hero.lede}</p>
</section>

        {/* WORK */}
        <section className="section" id="work">
          <div className="container">
            <div className="section-head">
              <h2>Selected Work</h2>
              <span className="num">⁄ 01</span>
            </div>

            <div className="projects">
              {/* Map over projects array — each object becomes one card.
                  "key" helps React track items efficiently. */}
              {projects.map((p) => (
                <ProjectCard key={p.title} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* WRITING */}
        <section className="section" id="writing">
          <div className="container">
            <div className="section-head">
              <h2>Writing</h2>
              <span className="num">⁄ 02</span>
            </div>

            <ul className="writing-list">
              {writing.map((w) => (
                <li key={w.title}>
                  <span className="date">{w.date}</span>
                  <a href="#">
                    <h4>{w.title}</h4>
                  </a>
                  <span className="read">{w.read}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section" id="about">
          <div className="container">
            <div className="section-head">
              <h2>About</h2>
              <span className="num">⁄ 03</span>
            </div>

            <div className="about-grid">
              <div>
                <p>
                  I'm a student working at NYU studying Computer Science and Economics 
                  as a part of the KAUST Gifted Student Program.
                </p>
                <p>
                  I care about craft, clarity, and making work that's both useful
                  and a little bit interesting. When I'm not at a keyboard, I'm
                  usually at the gym, rock climbing, playing football.
                </p>
              </div>
              <div className="about-meta">
                <dl>
                  <dt>Based</dt>
                  <dd>Riyadh &amp; New York City </dd>
                  <dt>Currently</dt>
                  <dd>Student at New York University</dd>
                  <dt>Previously</dt>
                  <dd>Student at The Pennsylvaniya State University</dd>
                  <dt>Tools</dt>
                  <dd>Code, Figma, ink, coffee</dd>
                  <dt>Elsewhere</dt>
                  <dd>
                    <a href="#">GitHub</a> · <a href="#">LinkedIn</a> ·{' '}
                    <a href="#">Twitter</a>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <p className="big">
          Let's <a href="mailto:you@example.com">talk</a>.
        </p>
        <div className="colophon">
          <span>© 2026 HASHIM MOTABAGANI</span>
          <span>هاشم مطبقاني</span>
          <span>Built with React · Hosted on NYU CIMS</span>
        </div>
      </footer>
    </>
  );
}

export default Home;
