import React from 'react';
import {
  MARKETING_SAMPLE_TRANSFER,
  MARKETING_TYPESCRIPT_NPM_IMPORT,
} from '@/lib/marketingSdkSnippetConstants';

function Line({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <br />
    </>
  );
}

/** Hero / marketing home — matches `MarketingHeroCodeSample` theme. */
export function TypescriptRailsAccountsTransferMarketingHero() {
  const kw = 'text-violet-700 dark:text-violet-400';
  const id = 'text-sky-800 dark:text-sky-300';
  const str = 'text-amber-800 dark:text-amber-300';
  const base = 'text-zinc-700 dark:text-zinc-400';
  const t = MARKETING_SAMPLE_TRANSFER;

  return (
    <code className={`${base} transition-colors`}>
      <Line>
        <span className={kw}>import</span> Rails <span className={kw}>from</span>{' '}
        <span className={str}>&apos;{MARKETING_TYPESCRIPT_NPM_IMPORT}&apos;</span>;
      </Line>
      <br />
      <Line>
        <span className={kw}>const</span> rails = <span className={kw}>new</span> <span className={id}>Rails</span>({'{'}
      </Line>
      <Line>
        {'  '}apiKey: process.env[<span className={str}>&apos;RAILS_API_KEY&apos;</span>],
      </Line>
      <Line>{'}'});</Line>
      <br />
      <Line>
        <span className={kw}>const</span> {'{'} transaction {'}'} = <span className={kw}>await</span> rails.accounts.
        <span className={id}>transfer</span>(<span className={str}>&apos;{t.fromAccountId}&apos;</span>, {'{'}
      </Line>
      <Line>
        {'  '}amount: <span className={str}>&apos;{t.amount}&apos;</span>,
      </Line>
      <Line>
        {'  '}to_account_id: <span className={str}>&apos;{t.toAccountId}&apos;</span>,
      </Line>
      <Line>
        {'  '}description: <span className={str}>&apos;{t.description}&apos;</span>,
      </Line>
      <Line>{'}'});</Line>
    </code>
  );
}

/** Infrastructure page code block — same source text as hero, infra syntax colors. */
export function TypescriptRailsAccountsTransferInfrastructure() {
  const t = MARKETING_SAMPLE_TRANSFER;

  function kw(s: string) {
    return <span className="text-purple-400">{s}</span>;
  }
  function strLit(s: string) {
    return <span className="text-amber-600 dark:text-yellow-300">{s}</span>;
  }
  function prop(s: string) {
    return <span className="text-emerald-600 dark:text-emerald-400">{s}</span>;
  }
  function typ(s: string) {
    return <span className="text-blue-300">{s}</span>;
  }

  return (
    <>
      {kw('import')} Rails {kw('from')} {strLit(`'${MARKETING_TYPESCRIPT_NPM_IMPORT}'`)};<br />
      <br />
      {kw('const')} rails = {kw('new')} Rails({'{'}
      <br />
      {'  '}
      {prop('apiKey')}: process.env[{strLit("'RAILS_API_KEY'")}],<br />
      {'}'});<br />
      <br />
      {kw('const')} {'{'} transaction {'}'} = {kw('await')} rails.accounts.{typ('transfer')}(
      {strLit(`'${t.fromAccountId}'`)}, {'{'}
      <br />
      {'  '}
      {prop('amount')}: {strLit(`'${t.amount}'`)},<br />
      {'  '}
      {prop('to_account_id')}: {strLit(`'${t.toAccountId}'`)},<br />
      {'  '}
      {prop('description')}: {strLit(`'${t.description}'`)},<br />
      {'}'});<br />
    </>
  );
}
