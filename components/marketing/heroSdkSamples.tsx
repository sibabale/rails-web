import React from 'react';

/** Labels match the shipped Stainless SDKs in `rails-sdks/`. */
export const HERO_SDK_LABELS = ['TypeScript', 'Go', 'Java', 'Kotlin', '.NET'] as const;
export type HeroSdkLabel = (typeof HERO_SDK_LABELS)[number];

const kw = 'text-violet-700 dark:text-violet-400';
const id = 'text-sky-800 dark:text-sky-300';
const str = 'text-amber-800 dark:text-amber-300';
const mut = 'text-emerald-800 dark:text-emerald-400';
const base = 'text-zinc-700 dark:text-zinc-400';

function Line({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <br />
    </>
  );
}

/** Account transfer sample aligned with `POST /api/v1/accounts/{id}/transfer` across SDKs. */
export function MarketingHeroCodeSample({ activeSdk }: { activeSdk: HeroSdkLabel }) {
  switch (activeSdk) {
    case 'TypeScript':
      return (
        <code className={`${base} transition-colors`}>
          <Line>
            <span className={kw}>import</span> Rails <span className={kw}>from</span>{' '}
            <span className={str}>&apos;@railsinfra/rails-typescript&apos;</span>;
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
            <span className={kw}>const</span> {'{'} transaction {'}'} ={' '}
            <span className={kw}>await</span> rails.accounts.<span className={id}>transfer</span>(
            <span className={str}>&apos;acc_checking_123&apos;</span>, {'{'}
          </Line>
          <Line>
            {'  '}amount: <span className={str}>&apos;5000&apos;</span>,
          </Line>
          <Line>
            {'  '}to_account_id: <span className={str}>&apos;acc_savings_456&apos;</span>,
          </Line>
          <Line>
            {'  '}description: <span className={str}>&apos;Monthly savings&apos;</span>,
          </Line>
          <Line>{'}'});</Line>
        </code>
      );
    case 'Go':
      return (
        <code className={`${base} transition-colors`}>
          <Line>
            <span className={kw}>import</span> (
          </Line>
          <Line>
            {'  '}<span className={str}>&quot;context&quot;</span>
          </Line>
          <Line>
            {'  '}<span className={str}>&quot;os&quot;</span>
          </Line>
          <Line>
            {'  '}<span className={str}>&quot;github.com/railsinfra/rails-go&quot;</span>
          </Line>
          <Line>
            {'  '}<span className={str}>&quot;github.com/railsinfra/rails-go/option&quot;</span>
          </Line>
          <Line>)</Line>
          <br />
          <Line>
            client := rails.<span className={id}>NewClient</span>(
          </Line>
          <Line>
            {'  '}option.<span className={id}>WithAPIKey</span>(os.<span className={id}>Getenv</span>(
            <span className={str}>&quot;RAILS_API_KEY&quot;</span>)),
          </Line>
          <Line>)</Line>
          <br />
          <Line>
            res, err := client.Accounts.<span className={id}>Transfer</span>(
          </Line>
          <Line>
            {'  '}context.<span className={id}>TODO</span>(),
          </Line>
          <Line>
            {'  '}<span className={str}>&quot;acc_checking_123&quot;</span>,
          </Line>
          <Line>
            {'  '}rails.<span className={id}>AccountTransferParams</span>{'{'}
          </Line>
          <Line>
            {'    '}Amount: <span className={str}>&quot;5000&quot;</span>,
          </Line>
          <Line>
            {'    '}ToAccountID: <span className={str}>&quot;acc_savings_456&quot;</span>,
          </Line>
          <Line>
            {'    '}Description: rails.<span className={id}>String</span>(<span className={str}>&quot;Monthly savings&quot;</span>),
          </Line>
          <Line>
            {'  '}{'}'}
          </Line>
          <Line>)</Line>
        </code>
      );
    case 'Java':
      return (
        <code className={`${base} transition-colors`}>
          <Line>
            <span className={kw}>import</span> com.rails.api.client.RailsClient;
          </Line>
          <Line>
            <span className={kw}>import</span> com.rails.api.client.okhttp.RailsOkHttpClient;
          </Line>
          <Line>
            <span className={kw}>import</span> com.rails.api.models.accounts.AccountTransferParams;
          </Line>
          <Line>
            <span className={kw}>import</span> com.rails.api.models.accounts.AccountTransferResponse;
          </Line>
          <br />
          <Line>
            RailsClient client = RailsOkHttpClient.<span className={id}>fromEnv</span>();
          </Line>
          <br />
          <Line>
            AccountTransferResponse response = client.accounts().<span className={id}>transfer</span>(
          </Line>
          <Line>
            {'    '}<span className={str}>&quot;acc_checking_123&quot;</span>,
          </Line>
          <Line>
            {'    '}AccountTransferParams.<span className={id}>builder</span>()
          </Line>
          <Line>
            {'        '}.<span className={mut}>amount</span>(<span className={str}>&quot;5000&quot;</span>)
          </Line>
          <Line>
            {'        '}.<span className={mut}>toAccountId</span>(<span className={str}>&quot;acc_savings_456&quot;</span>)
          </Line>
          <Line>
            {'        '}.<span className={mut}>description</span>(<span className={str}>&quot;Monthly savings&quot;</span>)
          </Line>
          <Line>
            {'        '}.<span className={id}>build</span>()
          </Line>
          <Line>
            {'    '});
          </Line>
        </code>
      );
    case 'Kotlin':
      return (
        <code className={`${base} transition-colors`}>
          <Line>
            <span className={kw}>import</span> com.rails.api.client.RailsClient
          </Line>
          <Line>
            <span className={kw}>import</span> com.rails.api.client.okhttp.RailsOkHttpClient
          </Line>
          <Line>
            <span className={kw}>import</span> com.rails.api.models.accounts.AccountTransferParams
          </Line>
          <br />
          <Line>
            <span className={kw}>val</span> client: RailsClient = RailsOkHttpClient.<span className={id}>fromEnv</span>()
          </Line>
          <br />
          <Line>
            <span className={kw}>val</span> response = client.accounts().<span className={id}>transfer</span>(
          </Line>
          <Line>
            {'    '}<span className={str}>&quot;acc_checking_123&quot;</span>,
          </Line>
          <Line>
            {'    '}AccountTransferParams.<span className={id}>builder</span>()
          </Line>
          <Line>
            {'        '}.<span className={mut}>amount</span>(<span className={str}>&quot;5000&quot;</span>)
          </Line>
          <Line>
            {'        '}.<span className={mut}>toAccountId</span>(<span className={str}>&quot;acc_savings_456&quot;</span>)
          </Line>
          <Line>
            {'        '}.<span className={mut}>description</span>(<span className={str}>&quot;Monthly savings&quot;</span>)
          </Line>
          <Line>
            {'        '}.<span className={id}>build</span>(),
          </Line>
          <Line>)</Line>
        </code>
      );
    case '.NET':
      return (
        <code className={`${base} transition-colors`}>
          <Line>
            <span className={kw}>using</span> Rails;
          </Line>
          <Line>
            <span className={kw}>using</span> Rails.Models.Accounts;
          </Line>
          <br />
          <Line>
            <span className={kw}>var</span> rails = <span className={kw}>new</span> <span className={id}>RailsClient</span>();
          </Line>
          <br />
          <Line>
            <span className={kw}>var</span> result = <span className={kw}>await</span> rails.Accounts.<span className={id}>Transfer</span>(
          </Line>
          <Line>
            {'    '}<span className={str}>&quot;acc_checking_123&quot;</span>,
          </Line>
          <Line>
            {'    '}<span className={kw}>new</span> AccountTransferParams {'{'}
          </Line>
          <Line>
            {'        '}Amount = <span className={str}>&quot;5000&quot;</span>,
          </Line>
          <Line>
            {'        '}ToAccountID = <span className={str}>&quot;acc_savings_456&quot;</span>,
          </Line>
          <Line>
            {'        '}Description = <span className={str}>&quot;Monthly savings&quot;</span>,
          </Line>
          <Line>
            {'    '}{'}'}
          </Line>
          <Line>
            {'    '});
          </Line>
        </code>
      );
    default: {
      const _exhaustive: never = activeSdk;
      return <code className={base}>{String(_exhaustive)}</code>;
    }
  }
}
