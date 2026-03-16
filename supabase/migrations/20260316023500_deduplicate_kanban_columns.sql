-- Step 1: Identify and delete duplicate columns for each user based on exact title match.
-- We keep the one with the lowest position (or earliest created_at if positions tie).
-- Note: Leads map to columns via the `leads.status` string matching `kanban_columns.title`.
-- Deleting duplicate kanban_column records does not orphan leads, as their status string 
-- will still match the remaining unique column with that exact title.
WITH ranked_cols AS (
  SELECT 
    id,
    ROW_NUMBER() OVER(
      PARTITION BY user_id, title 
      ORDER BY position ASC, created_at ASC
    ) as rn
  FROM public.kanban_columns
)
DELETE FROM public.kanban_columns
WHERE id IN (
  SELECT id FROM ranked_cols WHERE rn > 1
);

-- Step 2: Add a unique constraint to ensure users cannot create duplicate columns in the future.
ALTER TABLE public.kanban_columns
ADD CONSTRAINT kanban_columns_user_title_unique UNIQUE (user_id, title);
