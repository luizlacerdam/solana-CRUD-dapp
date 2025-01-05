'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useCruddappProgram, useCruddappProgramAccount } from './cruddapp-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function CruddappCreate() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { createEntry } = useCruddappProgram();
  const {publicKey} = useWallet();

  const isFormValid = title && message;

  const handleSumit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-warning">
        <span>Connect your wallet to create an entry.</span>
      </div>
    );
  }


  return (
    <div className='flex flex-col items-center space-y-4'>
      <input 
      type="text" 
      placeholder='Title'
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className='input input-bordered w-full max-w-xs'
      />
      <textarea
      placeholder='Message'
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className='textarea textarea-bordered w-full max-w-xs'
      />
      <button
      onClick={handleSumit}
      disabled={createEntry.isPending || !isFormValid}
      className='btn btn-xs lg:btn-md btn-primary'
      >
        Create Entry
      </button>
    </div>
  )
}

export function CruddappList() {
  const { accounts, getProgramAccount } = useCruddappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CruddappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CruddappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCruddappProgramAccount({
    account,
  })

  const { publicKey } = useWallet();
  const [message, setMessage] = useState('');
  const title = accountQuery.data?.title;

  const isFormValid = message && publicKey;
  
  const handleSumit = () => {
    if (isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-warning">
        <span>Connect your wallet to create an entry.</span>
      </div>
    );
  }
  

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>) : (
      <div className='card card-bordered border-base-300 border-4 text-neutral-content'> 
        <div className='card-body items-center text-center'>
          <div></div>
          <h2 className='card-title justify-center text-3xl cursor-pointer'
          onClick={ () => accountQuery.refetch()}
          >{accountQuery.data?.title}</h2>
          <p>{accountQuery.data?.message}</p>
          <div className='card-actions justify-around'>
              <textarea 
              placeholder='Message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='textarea textarea-bordered w-full max-w-xs'
              />
              <button
              onClick={handleSumit}
              disabled={updateEntry.isPending || !isFormValid}
              className='btn btn-xs lg:btn-md btn-primary'
              >
                Update Entry
              </button>
              <button
              onClick={() => {
                const title = accountQuery.data?.title;
                if (title) {
                  deleteEntry.mutateAsync(title);
                }
              }
              }
              disabled={deleteEntry.isPending}
              className='btn btn-xs lg:btn-md btn-error'
              >
                Delete Entry
              </button>
            </div>
        </div>
      </div>    
    )
}
