import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — Retirement Calculator',
  description: 'The math behind your Freedom Number, explained in plain English.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border-4 border-[#3D2008] p-6 sm:p-8" style={{ boxShadow: '5px 5px 0 #C68B57' }}>
      <h2 className="font-pixel text-[11px] text-[#E879A0] tracking-widest uppercase mb-4">{title}</h2>
      <div className="space-y-3 text-sm text-[#5C3D2E] leading-relaxed">{children}</div>
    </section>
  )
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-pixel text-[10px] text-[#3D2008] p-4 border-4 border-[#3D2008] my-4 leading-loose"
      style={{ background: '#FFF0E8', boxShadow: 'inset 2px 2px 0 #F0D9C4' }}
    >
      {children}
    </div>
  )
}

function Tick({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-5 h-5 border-2 border-[#3D2008] flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: color }}>
        <div className="w-1.5 h-1.5 bg-[#3D2008]" />
      </div>
      <span>{children}</span>
    </li>
  )
}

export default function HowItWorksPage() {
  return (
    <div style={{ background: '#FFF8F0', minHeight: '100vh' }}>

      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 sm:px-8 py-4 bg-white border-b-4 border-[#3D2008] sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 font-pixel text-[10px] text-[#3D2008] hover:text-[#E879A0] transition-colors"
        >
          ← Back to calculator
        </Link>
        <p className="font-pixel text-[10px] text-[#9B8578] hidden sm:block">How It Works</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Title */}
        <div className="text-center mb-4">
          <p className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase mb-3">Transparency</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#3D2008] mb-2">How the math works.</h1>
          <p className="text-[#9B8578] text-sm">Plain English explanations of every number we calculate.</p>
        </div>

        {/* 1. Freedom Number */}
        <Section title="Your Freedom Number">
          <p>
            Your <strong>Freedom Number</strong> is the total amount you need invested so your money works for you — forever. Once you hit it, you can stop working and live off your investment returns.
          </p>
          <Formula>
            Freedom Number = monthly expenses × 0.8 × 12 × 25
          </Formula>
          <p>
            <strong>Why × 0.8?</strong> We assume your spending drops ~20% in retirement. No commuting, no work wardrobe, potentially no mortgage, kids grown up. You can adjust your expenses input to reflect your actual retirement lifestyle.
          </p>
          <p>
            <strong>Why × 25?</strong> It comes from the 4% Safe Withdrawal Rule (see below). 1 ÷ 0.04 = 25.
          </p>
          <p>
            <strong>If you entered a pension / CPF payout:</strong> that monthly income is subtracted from your expenses before the formula runs — so your Freedom Number shrinks, because your portfolio doesn't need to cover what the government or your employer already covers.
          </p>
        </Section>

        {/* 2. 4% Rule */}
        <Section title="The 4% Safe Withdrawal Rule">
          <p>
            Once you're retired, you withdraw 4% of your portfolio per year. Research (the Trinity Study, 1998) found that portfolios invested in a mix of stocks and bonds survived 95%+ of all 30-year retirement periods at this rate — meaning you're very unlikely to run out of money.
          </p>
          <Formula>
            If you need $4,000/month → $48,000/year{'\n'}
            Freedom Number = $48,000 ÷ 0.04 = $1,200,000
          </Formula>
          <p>
            <strong>Note:</strong> The 4% rule was designed for 30-year retirements. If you want to retire very early (40s or earlier), some planners use 3–3.5% to be safer — which means a larger Freedom Number. You can adjust your return rate slider to model a more conservative scenario.
          </p>
        </Section>

        {/* 3. Compound Interest */}
        <Section title="How Your Savings Grow (Compound Interest)">
          <p>
            Every month, your portfolio earns a return. The next month, you earn a return on both your original money <em>and</em> last month's return. This snowball effect is compound interest.
          </p>
          <Formula>
            Future Value = PV × (1 + r)^n + PMT × ((1 + r)^n − 1) / r{'\n\n'}
            PV  = current savings{'\n'}
            PMT = monthly savings amount{'\n'}
            r   = monthly return rate (annual % ÷ 12){'\n'}
            n   = total months until retirement
          </Formula>
          <p>
            <strong>Example:</strong> $10,000 today at 7%/year for 30 years → <strong>~$76,000</strong>. You put in $10,000 once. Compound interest did the rest.
          </p>
          <p>
            <strong>Important:</strong> your entire savings balance (current savings + contributions) is modelled as earning the return rate you choose. If your money is split between a 1% savings account and a 9% stock portfolio, you should enter a blended rate that reflects your actual mix — see the Return Rate section below.
          </p>
        </Section>

        {/* 4. Salary Growth */}
        <Section title="Salary Growth (Full Picture Mode)">
          <p>
            If you enter a salary growth %, your monthly savings contributions grow by that percentage every year. A 3% raise means you can save 3% more per year — which accelerates your retirement timeline significantly over a decade.
          </p>
          <Formula>
            Year 1: save $500/mo{'\n'}
            Year 2 (3% growth): save $515/mo{'\n'}
            Year 5: save $563/mo{'\n'}
            Year 10: save $652/mo
          </Formula>
          <p>
            This was a bug in the original version — salary growth was collected but not applied to the calculations. It's now properly modelled year by year.
          </p>
        </Section>

        {/* 5. What counts as savings */}
        <Section title="What Counts as 'Current Savings'">
          <p className="font-semibold text-[#3D2008] mb-2">Include these:</p>
          <ul className="space-y-2 mb-4">
            <Tick color="#C8E6C9">Bank savings you plan to invest or already have invested</Tick>
            <Tick color="#C8E6C9">Brokerage / investment accounts (stocks, ETFs, bonds, unit trusts)</Tick>
            <Tick color="#C8E6C9">CPF Ordinary Account — OA (Singapore)</Tick>
            <Tick color="#C8E6C9">401k, Roth IRA, Traditional IRA (USA)</Tick>
            <Tick color="#C8E6C9">Superannuation (Australia) — if accessible by your retirement goal</Tick>
            <Tick color="#C8E6C9">RRSP, TFSA (Canada)</Tick>
            <Tick color="#C8E6C9">ISA, workplace pension (UK)</Tick>
          </ul>
          <p className="font-semibold text-[#3D2008] mb-2">Don't include these:</p>
          <ul className="space-y-2">
            <Tick color="#F4A7B9">Your home's value or equity — you'd have to sell to access it</Tick>
            <Tick color="#F4A7B9">Car, jewellery, physical assets — not liquid</Tick>
            <Tick color="#F4A7B9">CPF SA (Singapore) if you can't access it before your goal age — use the Locked Retirement Fund field instead</Tick>
            <Tick color="#F4A7B9">Business equity unless you plan to sell it</Tick>
          </ul>
        </Section>

        {/* 6. Locked retirement funds */}
        <Section title="Locked Retirement Funds (CPF SA, 401k, Super)">
          <p>
            Some retirement savings are locked until a specific age — CPF Special Account (Singapore) until ~65, 401k penalty-free after 59½ (USA), Superannuation after ~60 (Australia).
          </p>
          <p>
            In Full Picture mode, you can enter this balance separately. We handle it like this:
          </p>
          <ul className="space-y-2">
            <Tick color="#BBDEFB">If the access age ≤ your retirement goal → we add it to your current savings and count it toward your Freedom Number.</Tick>
            <Tick color="#FFE0B2">If the access age &gt; your retirement goal → we show it separately as a "future unlock" and project what it'll be worth when you can access it (using a conservative 4% rate, typical for CPF SA / government-backed funds). It won't shorten your Freedom Number calculation, but it's money you'll eventually have.</Tick>
          </ul>
        </Section>

        {/* 7. Investment return rate */}
        <Section title="The Investment Return Rate">
          <p>
            The return rate you choose is applied to your entire savings balance — both the money you have now and your future contributions. Choose a rate that reflects how your money is actually invested:
          </p>
          <div className="space-y-2 my-3">
            {[
              { rate: '2–3%',  label: 'High-yield savings account, fixed deposits, cash' },
              { rate: '4%',    label: 'CPF SA, government bonds, very conservative investing' },
              { rate: '5–6%',  label: 'Conservative portfolio (mostly bonds + some stocks)' },
              { rate: '7–8%',  label: 'Balanced portfolio — global index funds, 60/40 stocks+bonds' },
              { rate: '8–10%', label: 'Growth portfolio — mostly equities, index ETFs' },
              { rate: '10–12%',label: 'Aggressive — concentrated stocks, higher risk & volatility' },
            ].map(({ rate, label }) => (
              <div key={rate} className="flex gap-3 items-start">
                <span
                  className="font-pixel text-[9px] text-white px-2 py-1 border-2 border-[#3D2008] whitespace-nowrap flex-shrink-0"
                  style={{ background: '#3D2008' }}
                >
                  {rate}
                </span>
                <span className="text-sm text-[#5C3D2E]">{label}</span>
              </div>
            ))}
          </div>
          <p>
            The <strong>7% default</strong> is based on the long-run real return of global equity index funds (MSCI World Index). It accounts for inflation. Past returns don't guarantee future results, but it's the most commonly used assumption in retirement planning.
          </p>
          <p>
            If your savings are split — say 50% in a 1% savings account and 50% in stocks earning 9% — use the weighted average: 0.5 × 1% + 0.5 × 9% = <strong>5%</strong>.
          </p>
        </Section>

        {/* 8. Limitations */}
        <Section title="Limitations & What This Tool Doesn't Do">
          <ul className="space-y-2">
            <Tick color="#F4A7B9">Doesn't account for tax on investment gains or withdrawals (varies by country and account type)</Tick>
            <Tick color="#F4A7B9">Doesn't model sequence-of-returns risk — bad market years early in retirement hurt more than bad years later</Tick>
            <Tick color="#F4A7B9">Healthcare costs in retirement can be significant and are hard to predict</Tick>
            <Tick color="#F4A7B9">CPF / government benefit rules change over time — treat payouts as estimates</Tick>
            <Tick color="#F4A7B9">Doesn't account for children, inheritance, or major life events</Tick>
            <Tick color="#F4A7B9">Inflation: the 7% default is a real return (already adjusted). If you use nominal returns, your results will be optimistic</Tick>
          </ul>
          <p className="mt-4 text-xs text-[#9B8578] border-l-4 border-[#D4B5A0] pl-3">
            This calculator gives estimates to help you think about retirement — not financial advice. For decisions involving large sums, consult a licensed financial planner.
          </p>
        </Section>

        {/* Back CTA */}
        <div className="text-center pt-4 pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 border-4 border-[#3D2008] bg-[#E879A0] text-white font-pixel text-[10px] tracking-wide"
            style={{ boxShadow: '5px 5px 0 #3D2008' }}
          >
            ← Calculate My Number
          </Link>
          <p className="text-xs text-[#9B8578] mt-3">made with ♥ by heeeycookies</p>
        </div>

      </main>
    </div>
  )
}
