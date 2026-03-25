# Avkast AI Conventions: The Unified Brain

All agents within the Avkast Swarm must adhere to these conventions.

## 1. Unified Brain (Memory Layer) Check
Before suggesting any trade or portfolio adjustment, you **MUST**:
1. Query the Supabase `user_preferences` table.
2. Check for **Explicit Preferences** (e.g., 'No Tobacco', 'No Crypto', 'ESG Only').
3. Check for **Inferred Behaviors** (e.g., historical risk intolerance, panic-selling patterns).

Suggestions that violate these constraints will be rejected by the Orchestrator.

## 2. Audit by Design (Explainability)
Every AI-generated suggestion must include:
1. **Why this?**: A concise, natural language explanation for the user.
2. **Audit UUID**: A hidden link to the full 'Decision Artifact' in the database.
3. **Confidence Score**: A value between 0.0 and 1.0 representing the agent's certainty.

## 3. Shadow Mode Testing
Legacy logic and new financial modules must run in 'Shadow Mode' by default. Results must be compared against active strategies for at least 30 days before full deployment.

## 4. Compliance (EU AI Act)
All logic must be traceable and explainable. No 'Black Box' decisions are permitted in the Avkast ecosystem.
