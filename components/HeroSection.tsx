import Image from 'next/image'
import Link from 'next/link'

function HeroSection() {
  return (
    <section className="w-full rounded-[14px] bg-[#f3e4c7] px-6 py-7 md:px-10 md:py-9 lg:px-12 lg:py-11 mb-10 md:mb-16">
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_1fr_auto] lg:gap-8 xl:gap-10">
        <div className="max-w-[390px]">
          <h1 className="library-hero-title md:text-[52px] md:leading-[56px]">
            Your Library
          </h1>

          <p className="library-hero-description mt-4 max-w-[350px] md:text-lg md:leading-8">
            Convert your books into interactive AI conversations. Listen, learn,
            and discuss your favorite reads.
          </p>

          <Link
            href="/books/new"
            className="library-cta-primary mt-8 w-fit! px-8! py-4!">
            <span className="text-[30px] leading-none">+</span>
            <span>Add new book</span>
          </Link>
        </div>

        {/* Center Part - Desktop */}
        <div className="library-hero-illustration-desktop">
          <Image
            src="/assets/hero-illustration.png"
            alt="Vintage books and a globe"
            width={350}
            height={350}
            className="object-contain mix-blend-multiply"
          />
        </div>

        {/* Center Part - Mobile (Hidden on Desktop) */}
        <div className="library-hero-illustration">
          <Image
            src="/assets/hero-illustration.png"
            alt="Vintage books and a globe"
            width={300}
            height={300}
            className="object-contain mix-blend-multiply"
          />
        </div>

        <div className="library-steps-card mx-auto w-full max-w-65 p-6 lg:mx-0">
          <ol className="space-y-5">
            <li className="library-step-item">
              <span className="library-step-number">1</span>
              <div>
                <p className="library-step-title">Upload PDF</p>
                <p className="library-step-description">Add your book file</p>
              </div>
            </li>

            <li className="library-step-item">
              <span className="library-step-number">2</span>
              <div>
                <p className="library-step-title">AI Processing</p>
                <p className="library-step-description">
                  We analyze the content
                </p>
              </div>
            </li>

            <li className="library-step-item">
              <span className="library-step-number">3</span>
              <div>
                <p className="library-step-title">Voice Chat</p>
                <p className="library-step-description">Discuss with AI</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default HeroSection
