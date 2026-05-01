'use client';

import React, { useState } from 'react';
import { CodeScrollPane } from '../atoms/CodeScrollPane';

export type InfrastructureSdkLanguage = 'TypeScript' | 'Go' | 'Java' | 'Kotlin' | '.NET';

const SDK_OPTIONS: InfrastructureSdkLanguage[] = ['TypeScript', 'Go', 'Java', 'Kotlin', '.NET'];

type Operation = 'account' | 'transfer';

/** SDK-level request label (no raw HTTP path in the UI). */
const REQUEST_DESCRIPTION: Record<Operation, string> = {
  account: 'Create account',
  transfer: 'Transfer between accounts',
};

interface InfrastructureSdkCodeBlockProps {
  operation: Operation;
}

function kw(t: string) {
  return <span className="text-purple-400">{t}</span>;
}
function str(t: string) {
  return <span className="text-amber-600 dark:text-yellow-300">{t}</span>;
}
function prop(t: string) {
  return <span className="text-emerald-600 dark:text-emerald-400">{t}</span>;
}
function typ(t: string) {
  return <span className="text-blue-300">{t}</span>;
}

function AccountSnippet({ sdk }: { sdk: InfrastructureSdkLanguage }) {
  switch (sdk) {
    case 'TypeScript':
      return (
        <>
          {kw('import')} Rails {kw('from')} {str("'@railsinfra/rails-typescript'")};<br />
          <br />
          {kw('const')} client = {kw('new')} Rails({'{'}<br />
          {'  '}
          {prop('apiKey')}: process.env[{str("'RAILS_API_KEY'")}]!, <br />
          {'  '}
          {prop('baseURL')}: process.env[{str("'RAILS_BASE_URL'")}] ?? {str("'https://api.railsinfra.com'")},<br />
          {'  '}
          {prop('defaultHeaders')}: {'{'} {str("'X-Environment'")}: {str("'sandbox'")} {'}'},<br />
          {'}'});<br />
          <br />
          {kw('const')} account = {kw('await')} client.accounts.{typ('create')}(<br />
          {'  {'}
          <br />
          {'  '}
          {prop('account_type')}: {str("'checking'")},<br />
          {'  '}
          {prop('user_id')}: {str("'182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'")},<br />
          {'  '}
          {prop('currency')}: {str("'USD'")},<br />
          {'  }'}<br />
          );
        </>
      );
    case 'Go':
      return (
        <>
          {kw('import')} (<br />
          {'  '}{str('"context"')}<br />
          {'  '}{str('"github.com/railsinfra/rails-go"')}<br />
          )<br />
          <br />
          client := rails.{typ('NewClient')}()<br />
          account, err := client.Accounts.{typ('New')}(context.{typ('Background')}(), rails.AccountNewParams{'{'}<br />
          {'  '}
          {prop('AccountType')}: rails.AccountNewParamsAccountTypeChecking,<br />
          {'  '}
          {prop('UserID')}: rails.{typ('String')}({str('"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e"')}),<br />
          {'  '}
          {prop('Currency')}: rails.{typ('String')}({str('"USD"')}),<br />
          {'}'})<br />
        </>
      );
    case 'Java':
      return (
        <>
          {kw('import')} com.rails.api.client.RailsClient;<br />
          {kw('import')} com.rails.api.client.okhttp.RailsOkHttpClient;<br />
          {kw('import')} com.rails.api.models.accounts.AccountCreateParams;<br />
          {kw('import')} com.rails.api.models.accounts.AccountCreateResponse;<br />
          <br />
          RailsClient client = RailsOkHttpClient.{typ('fromEnv')}();<br />
          <br />
          AccountCreateResponse account = client.accounts().{typ('create')}(<br />
          {'    '}AccountCreateParams.{typ('builder')}()<br />
          {'        .'}{prop('accountType')}(AccountCreateParams.AccountType.{typ('CHECKING')})<br />
          {'        .'}{prop('userId')}({str('"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e"')})<br />
          {'        .'}{prop('currency')}({str('"USD"')})<br />
          {'        .'}{typ('build')}()<br />
          );
        </>
      );
    case 'Kotlin':
      return (
        <>
          {kw('import')} com.rails.api.client.RailsClient<br />
          {kw('import')} com.rails.api.client.okhttp.RailsOkHttpClient<br />
          {kw('import')} com.rails.api.models.accounts.AccountCreateParams<br />
          {kw('import')} com.rails.api.models.accounts.AccountCreateResponse<br />
          <br />
          {kw('val')} client: RailsClient = RailsOkHttpClient.{typ('fromEnv')}()<br />
          <br />
          {kw('val')} account: AccountCreateResponse = client.accounts().{typ('create')}(<br />
          {'    '}AccountCreateParams.{typ('builder')}()<br />
          {'        .'}{prop('accountType')}(AccountCreateParams.AccountType.{typ('CHECKING')})<br />
          {'        .'}{prop('userId')}({str('"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e"')})<br />
          {'        .'}{prop('currency')}({str('"USD"')})<br />
          {'        .'}{typ('build')}()<br />
          )<br />
        </>
      );
    case '.NET':
      return (
        <>
          {kw('using')} Rails;<br />
          {kw('using')} Rails.Models.Accounts;<br />
          <br />
          RailsClient client = {kw('new')} RailsClient();<br />
          <br />
          Account account = {kw('await')} client.Accounts.{typ('Create')}(<br />
          {'    '}{kw('new')} AccountCreateParams {'{'}<br />
          {'        '}
          {prop('AccountType')} = AccountType.Checking,<br />
          {'        '}
          {prop('UserID')} = {str("\"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e\"")},<br />
          {'        '}
          {prop('Currency')} = {str("\"USD\"")},<br />
          {'    }'});<br />
        </>
      );
    default:
      return null;
  }
}

function TransferSnippet({ sdk }: { sdk: InfrastructureSdkLanguage }) {
  switch (sdk) {
    case 'TypeScript':
      return (
        <>
          {kw('import')} Rails {kw('from')} {str("'@railsinfra/rails-typescript'")};<br />
          <br />
          {kw('const')} client = {kw('new')} Rails({'{'}<br />
          {'  '}
          {prop('apiKey')}: process.env[{str("'RAILS_API_KEY'")}]!, <br />
          {'  '}
          {prop('baseURL')}: process.env[{str("'RAILS_BASE_URL'")}] ?? {str("'https://api.railsinfra.com'")},<br />
          {'  '}
          {prop('defaultHeaders')}: {'{'} {str("'X-Environment'")}: {str("'sandbox'")} {'}'},<br />
          {'}'});<br />
          <br />
          {kw('const')} result = {kw('await')} client.accounts.{typ('transfer')}({str("'acc_checking_123'")}, {'{'}<br />
          {'  '}
          {prop('amount')}: {str("'50.00'")},<br />
          {'  '}
          {prop('to_account_id')}: {str("'acc_savings_456'")},<br />
          {'  '}
          {prop('description')}: {str("'Monthly savings'")},<br />
          {'}'});<br />
        </>
      );
    case 'Go':
      return (
        <>
          {kw('import')} (<br />
          {'  '}{str('"context"')}<br />
          {'  '}{str('"github.com/railsinfra/rails-go"')}<br />
          )<br />
          <br />
          client := rails.{typ('NewClient')}()<br />
          result, err := client.Accounts.{typ('Transfer')}(<br />
          {'    '}context.{typ('Background')}(),<br />
          {'    '}{str('"acc_checking_123"')},<br />
          {'    '}rails.AccountTransferParams{'{'}<br />
          {'      '}
          {prop('Amount')}: {str('"50.00"')},<br />
          {'      '}
          {prop('ToAccountID')}: {str('"acc_savings_456"')},<br />
          {'      '}
          {prop('Description')}: rails.{typ('String')}({str('"Monthly savings"')}),<br />
          {'    }'})<br />
        </>
      );
    case 'Java':
      return (
        <>
          {kw('import')} com.rails.api.client.RailsClient;<br />
          {kw('import')} com.rails.api.client.okhttp.RailsOkHttpClient;<br />
          {kw('import')} com.rails.api.models.accounts.AccountTransferParams;<br />
          {kw('import')} com.rails.api.models.accounts.AccountTransferResponse;<br />
          <br />
          RailsClient client = RailsOkHttpClient.{typ('fromEnv')}();<br />
          <br />
          AccountTransferResponse result = client.accounts().{typ('transfer')}(<br />
          {'    '}AccountTransferParams.{typ('builder')}()<br />
          {'        .'}{prop('id')}({str('"acc_checking_123"')})<br />
          {'        .'}{prop('amount')}({str('"50.00"')})<br />
          {'        .'}{prop('toAccountId')}({str('"acc_savings_456"')})<br />
          {'        .'}{prop('description')}({str('"Monthly savings"')})<br />
          {'        .'}{typ('build')}()<br />
          );<br />
        </>
      );
    case 'Kotlin':
      return (
        <>
          {kw('import')} com.rails.api.client.RailsClient<br />
          {kw('import')} com.rails.api.client.okhttp.RailsOkHttpClient<br />
          {kw('import')} com.rails.api.models.accounts.AccountTransferParams<br />
          {kw('import')} com.rails.api.models.accounts.AccountTransferResponse<br />
          <br />
          {kw('val')} client: RailsClient = RailsOkHttpClient.{typ('fromEnv')}()<br />
          <br />
          {kw('val')} result: AccountTransferResponse = client.accounts().{typ('transfer')}(<br />
          {'    '}AccountTransferParams.{typ('builder')}()<br />
          {'        .'}{prop('id')}({str('"acc_checking_123"')})<br />
          {'        .'}{prop('amount')}({str('"50.00"')})<br />
          {'        .'}{prop('toAccountId')}({str('"acc_savings_456"')})<br />
          {'        .'}{prop('description')}({str('"Monthly savings"')})<br />
          {'        .'}{typ('build')}()<br />
          )<br />
        </>
      );
    case '.NET':
      return (
        <>
          {kw('using')} Rails;<br />
          {kw('using')} Rails.Models.Accounts;<br />
          <br />
          RailsClient client = {kw('new')} RailsClient();<br />
          <br />
          AccountTransferResponse result = {kw('await')} client.Accounts.{typ('Transfer')}(<br />
          {'    '}{kw('new')} AccountTransferParams {'{'}<br />
          {'        '}
          {prop('ID')} = {str("\"acc_checking_123\"")},<br />
          {'        '}
          {prop('Amount')} = {str("\"50.00\"")},<br />
          {'        '}
          {prop('ToAccountID')} = {str("\"acc_savings_456\"")},<br />
          {'        '}
          {prop('Description')} = {str("\"Monthly savings\"")},<br />
          {'    }'});<br />
        </>
      );
    default:
      return null;
  }
}

export function InfrastructureSdkCodeBlock({ operation }: InfrastructureSdkCodeBlockProps) {
  const [activeSdk, setActiveSdk] = useState<InfrastructureSdkLanguage>('TypeScript');
  const [menuOpen, setMenuOpen] = useState(false);
  const requestDescription = REQUEST_DESCRIPTION[operation];

  return (
    <div
      className="border structural-border bg-white dark:bg-black w-full shadow-lg dark:shadow-xl transition-colors"
      data-testid={`infrastructure-sdk-code-${operation}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b structural-border bg-zinc-100 dark:bg-[#0a0a0a] transition-colors">
        <div
          className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 truncate"
          title={requestDescription}
        >
          {requestDescription}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            data-testid={`infrastructure-sdk-toggle-${operation}`}
            onClick={() => setMenuOpen((o) => !o)}
            className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-sm shadow-sm dark:shadow-none"
          >
            {activeSdk}{' '}
            <span
              className={`material-symbols-sharp transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              style={{ fontSize: '0.75rem' }}
            >
              expand_more
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1 rounded-sm shadow-xl z-50 min-w-[120px]">
              {SDK_OPTIONS.map((sdk) => (
                <button
                  key={sdk}
                  type="button"
                  onClick={() => {
                    setActiveSdk(sdk);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 font-mono text-[10px] transition-colors ${
                    activeSdk === sdk
                      ? 'text-black dark:text-white bg-zinc-100 dark:bg-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {sdk}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <CodeScrollPane className="p-6" data-testid="infrastructure-sdk-code-scroll">
        <pre className="font-mono text-[13px] leading-relaxed">
          <code className="text-zinc-800 dark:text-zinc-300">
            {operation === 'account' ? <AccountSnippet sdk={activeSdk} /> : <TransferSnippet sdk={activeSdk} />}
          </code>
        </pre>
      </CodeScrollPane>
    </div>
  );
}
