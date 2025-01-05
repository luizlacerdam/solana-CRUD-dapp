#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("EnHt7CZy8bHeTRJ3RXMYxb6BnkzctJ2HNNuiq58rHQPf");

pub const ANCHOR_DISCRIMINATOR_SPACE: usize = 8;

#[program]
pub mod cruddapp {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = *ctx.accounts.owner.key;
        journal_entry.title = title;
        journal_entry.message = message;

        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;

        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(
      mut,
      seeds = [journal_entry.title.as_bytes(), owner.key().as_ref()],
      bump,
      close = owner,
    )]
    pub journal_entry: Account<'info, JornalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
    #[account(
      mut,
      seeds = [journal_entry.title.as_bytes(), owner.key().as_ref()],
      bump,
      realloc = ANCHOR_DISCRIMINATOR_SPACE + JornalEntryState::INIT_SPACE,
      realloc::payer = owner,
      realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JornalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
    #[account(
      init,
      payer = owner,
      space = ANCHOR_DISCRIMINATOR_SPACE + JornalEntryState::INIT_SPACE,
      seeds = [title.as_bytes(), owner.key().as_ref()],
      bump,
    )]
    pub journal_entry: Account<'info, JornalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct JornalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(280)]
    pub message: String,
}
