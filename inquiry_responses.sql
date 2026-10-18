-- ==============================================================================
-- OPEN-INQUIRY RESPONSES ("Quick Scientist's Thought") - run in Supabase SQL Editor
-- ==============================================================================
-- Stores each learner's answer to the open-inquiry prompt and the Advanced
-- Agastya Question Matrix codes returned by the ML model (framework section 6).
-- Codes are measurement data only. Per the framework, any numerical score must
-- later be derived from validated human labels; human_codes is where trained
-- raters record their codes so ML agreement can be checked (section 7).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.inquiry_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mock_test_id INTEGER NOT NULL CHECK (mock_test_id BETWEEN 1 AND 13),
    experiment_index INTEGER NOT NULL CHECK (experiment_index BETWEEN 0 AND 2),
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('common_anchor', 'next_investigation', 'after_anomaly')),
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL CHECK (char_length(response_text) BETWEEN 1 AND 600),
    anomaly_triggered BOOLEAN NOT NULL DEFAULT false,

    -- A. Epistemic depth (0-6) and B. Inquiry stage
    epistemic_depth SMALLINT CHECK (epistemic_depth BETWEEN 0 AND 6),
    inquiry_stage TEXT CHECK (inquiry_stage IN ('Notice', 'Wonder', 'Predict', 'Explore', 'Compare', 'Explain', 'Extend')),
    -- C. Analytic quality dimensions (0-2 each)
    evidence_grounding SMALLINT CHECK (evidence_grounding BETWEEN 0 AND 2),
    testability SMALLINT CHECK (testability BETWEEN 0 AND 2),
    causal_orientation SMALLINT CHECK (causal_orientation BETWEEN 0 AND 2),
    generativity SMALLINT CHECK (generativity BETWEEN 0 AND 2),
    transfer SMALLINT CHECK (transfer BETWEEN 0 AND 2),
    uncertainty_specificity SMALLINT CHECK (uncertainty_specificity BETWEEN 0 AND 2),

    coding_status TEXT NOT NULL DEFAULT 'pending' CHECK (coding_status IN ('pending', 'coded')),
    coding_model TEXT,
    coded_at TIMESTAMPTZ,
    human_codes JSONB, -- filled by trained raters for ML validation

    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT inquiry_responses_one_per_experiment UNIQUE (user_id, mock_test_id, experiment_index)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_responses_user_id ON public.inquiry_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_pending ON public.inquiry_responses(coding_status) WHERE coding_status = 'pending';

ALTER TABLE public.inquiry_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners can view their own inquiry responses" ON public.inquiry_responses;
CREATE POLICY "Learners can view their own inquiry responses"
  ON public.inquiry_responses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own inquiry responses" ON public.inquiry_responses;
CREATE POLICY "Learners can insert their own inquiry responses"
  ON public.inquiry_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own inquiry responses" ON public.inquiry_responses;
CREATE POLICY "Learners can update their own inquiry responses"
  ON public.inquiry_responses FOR UPDATE
  USING (auth.uid() = user_id);
