# Comprehensive Research: Learning Science for Skill Map Module Rebuild

## Target Context
Arabic math textbook quizzes for grade school (K-12). This document covers the theoretical foundations, mathematical formulas, practical parameter defaults, and implementation considerations for building an adaptive skill tracking and spaced repetition system.

---

## Table of Contents
1. [Bayesian Knowledge Tracing (BKT)](#1-bayesian-knowledge-tracing-bkt)
2. [Performance Factors Analysis (PFA)](#2-performance-factors-analysis-pfa)
3. [Item Response Theory (IRT)](#3-item-response-theory-irt)
4. [Spaced Repetition Algorithms](#4-spaced-repetition-algorithms)
5. [Bloom's Revised Taxonomy](#5-blooms-revised-taxonomy)
6. [Forgetting Curves & Retention](#6-forgetting-curves--retention)
7. [Zone of Proximal Development (ZPD)](#7-zone-of-proximal-development-zpd)
8. [Mastery Learning](#8-mastery-learning)
9. [Synthesis: Recommendations for the Skill Map Module](#9-synthesis-recommendations-for-the-skill-map-module)

---

## 1. Bayesian Knowledge Tracing (BKT)

### 1.1 Overview

Bayesian Knowledge Tracing is a probabilistic modeling framework for inferring and updating latent student mastery of specific knowledge components (KCs) based on observed responses. Formalized as a Hidden Markov Model (HMM) by Corbett & Anderson (1995), it remains the most widely used student model in intelligent tutoring systems.

**Key Reference:** Corbett, A.T. & Anderson, J.R. (1995). "Knowledge tracing: Modeling the acquisition of procedural knowledge." *User Modeling and User-Adapted Interaction*, 4(4), 253-278.

### 1.2 The Four Parameters

| Parameter | Symbol | Meaning | Typical Range |
|-----------|--------|---------|---------------|
| Initial Knowledge | P(L0) | Probability student already knows the skill before first encounter | 0.05 - 0.50 |
| Learn/Transition | P(T) | Probability of learning the skill after one practice opportunity | 0.05 - 0.40 |
| Guess | P(G) | Probability of correct answer when skill is NOT known | 0.05 - 0.40 |
| Slip | P(S) | Probability of incorrect answer when skill IS known | 0.01 - 0.20 |

**Critical Constraint:** P(G) + P(S) < 1 (otherwise the model becomes semantically degenerate -- meaning a student who does NOT know the skill would be more likely to answer correctly than one who does).

### 1.3 The Update Equations (Step by Step)

The BKT update process has two stages at each time step:

#### Stage 1: Posterior Update (Bayesian inference given observation)

**If the student answers CORRECTLY:**

```
P(L_t | correct) = P(L_t) * (1 - P(S)) / [P(L_t) * (1 - P(S)) + (1 - P(L_t)) * P(G)]
```

**If the student answers INCORRECTLY:**

```
P(L_t | incorrect) = P(L_t) * P(S) / [P(L_t) * P(S) + (1 - P(L_t)) * (1 - P(G))]
```

These are direct applications of Bayes' theorem:
- Numerator = probability of the observed outcome assuming the student KNOWS the skill
- Denominator = total probability of the observed outcome (known + not known)

#### Stage 2: Transition Update (learning opportunity)

After the posterior update, we apply the transition (learning) probability:

```
P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
```

This captures the idea that even if the student did not know the skill before this step, they may have learned it during this practice opportunity.

#### Emission Probabilities

The probability of observing a correct response at time t:

```
P(correct_t) = P(L_t) * (1 - P(S)) + (1 - P(L_t)) * P(G)
```

The probability of observing an incorrect response at time t:

```
P(incorrect_t) = P(L_t) * P(S) + (1 - P(L_t)) * (1 - P(G))
```

### 1.4 Worked Example

Suppose for a skill "2-digit addition":
- P(L0) = 0.10 (10% chance student already knows it)
- P(T) = 0.20 (20% chance of learning per opportunity)
- P(G) = 0.25 (25% chance of guessing correctly)
- P(S) = 0.05 (5% chance of slipping)

**Student answers correctly on first attempt:**

```
P(L1 | correct) = 0.10 * (1 - 0.05) / [0.10 * 0.95 + 0.90 * 0.25]
                = 0.095 / [0.095 + 0.225]
                = 0.095 / 0.32
                = 0.297

P(L2) = 0.297 + (1 - 0.297) * 0.20
      = 0.297 + 0.141
      = 0.438
```

After one correct answer, the estimated mastery rose from 10% to 43.8%.

**Student answers incorrectly on second attempt:**

```
P(L2 | incorrect) = 0.438 * 0.05 / [0.438 * 0.05 + 0.562 * 0.75]
                   = 0.0219 / [0.0219 + 0.4215]
                   = 0.0219 / 0.4434
                   = 0.0494

P(L3) = 0.0494 + (1 - 0.0494) * 0.20
      = 0.0494 + 0.190
      = 0.240
```

After the incorrect answer, mastery dropped from 43.8% to 24.0%.

### 1.5 Parameter Estimation Methods

1. **Expectation-Maximization (EM):** The standard approach. Iteratively estimates parameters by computing expected hidden states and maximizing likelihood. Implemented in pyBKT.
2. **Brute-force grid search:** Corbett & Anderson's original approach. Search over a discretized parameter space. Computationally expensive but avoids local minima.
3. **Gradient descent:** Less common but used in some implementations.
4. **Cross-validation:** Fit parameters to training data, evaluate on held-out data.

### 1.6 Practical Default Parameters for K-12 Math

Based on research across multiple tutoring systems (ASSISTments, Cognitive Tutor):

| Parameter | Conservative Default | Notes |
|-----------|---------------------|-------|
| P(L0) | 0.10 | Assume most students start not knowing the skill |
| P(T) | 0.20 | Moderate learning rate per opportunity |
| P(G) | 0.20 | For 4-choice MCQ, random would be 0.25; slight reduction for plausible distractors |
| P(S) | 0.05 | Slips are relatively rare for well-known skills |

For **multiple-choice questions with 4 options**, P(G) should be near 0.25 (random chance). For **open-response questions**, P(G) can be as low as 0.01-0.05.

### 1.7 Limitations of BKT

1. **Semantic model degeneracy:** Different parameter sets can produce the same predictions. The EM algorithm can converge to parameters where P(G) > P(S), which is semantically nonsensical (a student who does NOT know would be more likely to answer correctly than one who does). Solution: impose constraints P(G) < 0.5, P(S) < 0.5, P(G) + P(S) < 1.

2. **Single skill per item assumption:** Standard BKT assumes each item tests exactly one KC. In practice, math problems often involve multiple skills. Extensions exist (e.g., multi-skill BKT) but add complexity.

3. **No forgetting:** Standard BKT assumes monotonic knowledge growth -- once learned, never forgotten. This is unrealistic. Extensions like "BKT with forgetting" add a forgetting parameter but increase complexity.

4. **Binary knowledge state:** Students either "know" or "don't know" -- no partial knowledge. This is a simplification.

5. **Sensitivity to noise:** Naturally occurring data can have low signal-to-noise ratio, leading to degenerate parameters.

6. **Identifiability concerns:** While technically identifiable under mild conditions, in practice different parameter sets can fit data comparably well, making interpretation difficult.

### 1.8 When to Use BKT

- You have a well-defined skill/KC model
- You want per-skill mastery tracking
- You need interpretable parameters
- You have enough data per skill (at least ~100 student-skill interactions for reliable fitting)
- For a K-12 quiz app, BKT is appropriate if each quiz question maps to a clear skill

**Key References:**
- [Bayesian Knowledge Tracing - Wikipedia](https://en.wikipedia.org/wiki/Bayesian_knowledge_tracing)
- [Properties of the BKT Model (Van de Sande)](https://files.eric.ed.gov/fulltext/EJ1115329.pdf)
- [pyBKT: Python Library for BKT](https://pypi.org/project/pyBKT/1.1.1/)
- [Standard BKT Models](https://iedms.github.io/standard-bkt/)

---

## 2. Performance Factors Analysis (PFA)

### 2.1 Overview

Performance Factors Analysis was introduced by Pavlik, Cen, & Koedinger (2009) as an alternative to BKT that uses logistic regression to predict student performance. It tracks cumulative successes and failures per knowledge component rather than maintaining a latent binary knowledge state.

**Key Reference:** Pavlik, P.I., Cen, H., & Koedinger, K.R. (2009). "Performance Factors Analysis -- A New Alternative to Knowledge Tracing." *Proceedings of AIED 2009*.

### 2.2 The PFA Formula

The model computes a logit value **m** for student **i** on knowledge component **j**:

```
m_ij = beta_j + gamma_j * s_ij + rho_j * f_ij
```

Where:
- **beta_j** = difficulty/easiness parameter for KC j (intercept)
- **gamma_j** = learning rate from successes for KC j
- **rho_j** = learning rate from failures for KC j
- **s_ij** = count of prior successes by student i on KC j
- **f_ij** = count of prior failures by student i on KC j

The probability of correctness is then computed via the logistic (sigmoid) function:

```
P(correct) = 1 / (1 + e^(-m_ij))
```

If an item involves **multiple KCs**, the logit values are summed:

```
m = SUM_j [beta_j + gamma_j * s_ij + rho_j * f_ij]
```

### 2.3 Parameter Interpretation

| Parameter | Meaning | Expected Sign |
|-----------|---------|---------------|
| beta_j | Baseline difficulty of KC j. Higher = easier. | Varies |
| gamma_j | Benefit of each prior success. Higher = more learning from success. | Positive (typically 0.1-0.5) |
| rho_j | Benefit of each prior failure. Can be positive (learning from mistakes) or negative (confusion accumulates). | Can be positive or negative |

### 2.4 PFA vs. BKT Comparison

| Aspect | PFA | BKT |
|--------|-----|-----|
| Model type | Logistic regression | Hidden Markov Model |
| Knowledge state | Implicit (via success/failure counts) | Explicit binary (know/don't know) |
| Multiple skills per item | Naturally supported | Requires extensions |
| Learning rates | Separate for success vs. failure | Single transition rate |
| Forgetting | Not modeled (cumulative counts only grow) | Not modeled (standard BKT) |
| Parameter fitting | Standard logistic regression (fast, global optimum) | EM algorithm (slower, local minima possible) |
| Interpretability | Moderate (regression weights) | High (probabilistic parameters) |
| Predictive accuracy | Approximately equal to BKT across many studies | Approximately equal to PFA |

### 2.5 When PFA Is Better Than BKT

1. **Items involve multiple KCs:** PFA naturally handles multi-skill items by summing logit contributions.
2. **You want fast parameter fitting:** Standard logistic regression has a closed-form gradient and convex loss surface -- no local minima.
3. **You want to distinguish learning from success vs. failure:** Separate gamma and rho parameters let you detect whether failures help or hurt learning for each KC.
4. **You have heterogeneous items:** Different items can have different difficulty parameters.

### 2.6 Limitations

1. **No explicit mastery state:** PFA outputs probability of correct response, not a mastery probability. There is no clear "mastered" vs. "not mastered" threshold.
2. **No forgetting:** Success and failure counts only accumulate, never decay. Old successes count the same as recent ones.
3. **Counts are crude:** A student with 5 successes out of 5 attempts and one with 5 successes out of 20 attempts look very different in PFA (different failure counts), but the model does not directly represent "accuracy rate."

### 2.7 Practical Application to K-12 Math Quiz App

For an Arabic math textbook quiz app:
- Map each textbook skill (e.g., "3-digit subtraction with borrowing") to a KC
- Track cumulative successes (s) and failures (f) per student per KC
- Use logistic regression to predict next-attempt probability
- Use the predicted probability to select appropriate difficulty level
- Start with gamma = 0.3, rho = 0.1, beta fitted to item data

**Key References:**
- [PFA Original Paper (Pavlik, Cen, Koedinger 2009)](https://pact.cs.cmu.edu/koedinger/pubs/AIED%202009%20final%20Pavlik%20Cen%20Keodinger%20corrected.pdf)
- [Logistic Knowledge Tracing Tutorial](https://yilinl.quarto.pub/pfa/)
- [PFA on Semantic Scholar](https://www.semanticscholar.org/paper/Performance-Factors-Analysis-A-New-Alternative-to-Pavlik-Cen/9588acb2634d7a19124d6012e0b4f1ea1c9736ea)

---

## 3. Item Response Theory (IRT)

### 3.1 Overview

Item Response Theory is a family of psychometric models that relate the probability of a correct response to latent ability (theta) and item characteristics. IRT is the gold standard for standardized testing and adaptive assessment.

### 3.2 The Three Models

#### 3.2.1 One-Parameter Logistic Model (1PL / Rasch Model)

```
P(X=1 | theta, b) = 1 / (1 + e^(-(theta - b)))
```

- **theta** = student ability (latent trait, typically on scale of -3 to +3)
- **b** = item difficulty (on same scale as theta)

Only item difficulty varies. All items have equal discrimination. This is the simplest model and has the property of "specific objectivity" -- item difficulty rankings are the same for all students, and student ability rankings are the same for all items.

#### 3.2.2 Two-Parameter Logistic Model (2PL)

```
P(X=1 | theta, a, b) = 1 / (1 + e^(-a(theta - b)))
```

- **a** = item discrimination (how sharply the item differentiates between high and low ability students). Typical range: 0.5 - 2.5.
- **b** = item difficulty. Typical range: -3 to +3.

Higher discrimination means the item is better at distinguishing students near the difficulty threshold.

#### 3.2.3 Three-Parameter Logistic Model (3PL)

```
P(X=1 | theta, a, b, c) = c + (1 - c) / (1 + e^(-a(theta - b)))
```

- **c** = pseudo-guessing parameter (lower asymptote). For 4-choice MCQ, c is often around 0.25 (1/k where k = number of options).
- The probability never drops below c, even for very low ability.

### 3.3 Parameter Interpretation for K-12 Math

| Parameter | Symbol | Typical Values | K-12 Math Interpretation |
|-----------|--------|----------------|--------------------------|
| Ability | theta | -3 to +3 (standardized) | Student's math proficiency level |
| Difficulty | b | -3 to +3 | How hard the question is. b=0 is average. |
| Discrimination | a | 0.5 - 2.5 | How well the question separates high/low students. a=1 is typical. |
| Guessing | c | 0 - 0.35 | Chance of guessing correctly. 0.25 for 4-choice MCQ. |

### 3.4 Student Ability Estimation (Theta)

Three main methods for estimating theta:

#### Maximum Likelihood Estimation (MLE)

Find theta that maximizes the likelihood of the observed response pattern:

```
L(theta) = PRODUCT_i [P_i(theta)^x_i * (1 - P_i(theta))^(1-x_i)]
```

Where x_i = 1 if correct, 0 if incorrect on item i.

Take the log-likelihood and find the maximum via Newton-Raphson iteration:

```
theta_{new} = theta_{old} + [SUM_i (x_i - P_i) * a_i] / [SUM_i a_i^2 * P_i * (1-P_i)]
```

**Limitation:** Cannot estimate theta for all-correct or all-incorrect response patterns (likelihood is monotonic).

#### Expected A Posteriori (EAP)

```
theta_EAP = INTEGRAL[theta * L(theta) * f(theta) d_theta] / INTEGRAL[L(theta) * f(theta) d_theta]
```

Where f(theta) is the prior distribution (typically N(0,1)). EAP always produces a finite estimate, even for extreme response patterns. This is the most stable method and recommended for adaptive testing.

#### Maximum A Posteriori (MAP)

```
theta_MAP = argmax [L(theta) * f(theta)]
```

Finds the mode of the posterior distribution. Less computationally expensive than EAP and always produces finite estimates.

### 3.5 Item Information Function

The information provided by an item at ability level theta:

**For 2PL:**
```
I(theta) = a^2 * P(theta) * (1 - P(theta))
```

**For 3PL:**
```
I(theta) = a^2 * [(P(theta) - c)^2 / ((1-c)^2 * P(theta))] * (1 - P(theta))
```

Maximum information occurs near theta = b (the item difficulty). This is the basis for adaptive item selection.

### 3.6 Adaptive Testing with IRT

The Computerized Adaptive Testing (CAT) loop:

1. Start with theta estimate = 0 (or use prior information)
2. Select the item with maximum information at current theta estimate
3. Administer the item and record response
4. Update theta estimate using MLE, EAP, or MAP
5. Check termination criteria (e.g., standard error < 0.30, or maximum items reached)
6. If not terminated, go to step 2

**Item Selection:** Select the item i that maximizes I_i(theta_current). This is the Maximum Fisher Information criterion.

**Standard Error of Measurement:**
```
SE(theta) = 1 / sqrt(SUM_i I_i(theta))
```

A common stopping rule is SE(theta) < 0.30.

### 3.7 Advantages and Limitations

**Advantages:**
- Principled probabilistic framework with strong mathematical foundations
- Enables adaptive testing (shorter tests, same precision)
- Item parameters are invariant across populations (sample independence)
- Rich theory for test design, equating, and scoring

**Limitations:**
- Requires large item pools (50+ items per skill for stable calibration)
- Requires large student samples for item calibration (200+ for 1PL, 500+ for 2PL, 1000+ for 3PL)
- Static model: does not model learning over time
- Unidimensional assumption (standard IRT assumes one latent ability)

### 3.8 Application to K-12 Math Quiz App

- Use 1PL (Rasch) for simplicity if items are well-constructed
- Pre-calibrate item difficulties based on field testing or expert judgment
- Use EAP for theta estimation (most stable for short tests)
- Implement basic adaptive item selection: choose items near student's current ability
- For MCQ with 4 choices, use 3PL with c = 0.25

**Key References:**
- [Item Response Theory - Wikipedia](https://en.wikipedia.org/wiki/Item_response_theory)
- [Logistic IRT Models (Penn State)](https://quantdev.ssri.psu.edu/sites/qdev/files/IRT_tutorial_FA17_2.html)
- [3PL Model (Assessment Systems)](https://assess.com/three-parameter-irt-3pl-model/)
- [Ability Parameters Estimation Guide](https://www.cogn-iq.org/learn/theory/ability-parameters-estimation/)

---

## 4. Spaced Repetition Algorithms

### 4.1 Ebbinghaus Forgetting Curve Foundation

The basic exponential decay model:

```
R = e^(-t/S)
```

Where:
- R = retrievability (probability of recall, 0 to 1)
- t = time since last review
- S = stability (memory strength; higher = slower forgetting)

This means that after time S, retrievability drops to e^(-1) = 0.368 (36.8%).

### 4.2 SM-2 Algorithm (SuperMemo 2)

The SM-2 algorithm, developed by Piotr Wozniak (1987), is the basis for Anki and many spaced repetition apps.

#### Quality Rating Scale (0-5)

| Grade | Meaning |
|-------|---------|
| 5 | Perfect response |
| 4 | Correct response after hesitation |
| 3 | Correct response with serious difficulty |
| 2 | Incorrect; correct answer seemed easy to recall |
| 1 | Incorrect; correct answer remembered upon seeing it |
| 0 | Complete blackout |

#### Easiness Factor (EF) Update Formula

```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
```

Where q is the quality rating (0-5). Minimum EF = 1.3.

**Effect of quality on EF change:**
| Quality (q) | EF Change |
|-------------|-----------|
| 5 | +0.10 |
| 4 | +0.00 (no change) |
| 3 | -0.14 |
| 2 | -0.32 |
| 1 | -0.54 |
| 0 | -0.80 |

#### Interval Calculation

```
I(1) = 1 day
I(2) = 6 days
I(n) = I(n-1) * EF   for n > 2
```

Round fractional intervals up to the nearest whole number.

#### Complete Algorithm Steps

1. Initialize EF = 2.5 for all new items
2. After each review, rate quality q (0-5)
3. Update EF using the formula above (enforce minimum 1.3)
4. **If q >= 3 (correct):** Advance to next interval using I(n) formula
5. **If q < 3 (incorrect):** Reset repetition count to 0, restart from I(1) = 1 day. EF is NOT changed on failure.
6. After a session, re-review all items that scored below 4 until they score at least 4

#### Example Progression (EF = 2.5, all quality = 4)

| Review # | Interval |
|----------|----------|
| 1 | 1 day |
| 2 | 6 days |
| 3 | 6 * 2.5 = 15 days |
| 4 | 15 * 2.5 = 38 days |
| 5 | 38 * 2.5 = 94 days |
| 6 | 94 * 2.5 = 235 days |

### 4.3 FSRS (Free Spaced Repetition Scheduler)

FSRS is a modern algorithm developed by Jarrett Ye, based on the DSR (Difficulty, Stability, Retrievability) memory model. It uses 19-21 parameters (depending on version) optimized via machine learning. FSRS achieves 20-30% fewer reviews than SM-2 for the same retention level.

**Key Reference:** Open-source implementation at [github.com/open-spaced-repetition/fsrs4anki](https://github.com/open-spaced-repetition/fsrs4anki)

#### Core Memory State Variables

| Variable | Symbol | Meaning |
|----------|--------|---------|
| Stability | S | Time (in days) for retrievability to drop from 100% to 90% |
| Difficulty | D | How hard it is to increase stability. Range: [1, 10] |
| Retrievability | R | Current probability of successful recall |

#### Retrievability (Forgetting Curve)

**FSRS v4 (simplified):**
```
R(t, S) = (1 + t / (9 * S))^(-1)
```

**FSRS v4.5+ (with configurable decay):**
```
R(t, S) = (1 + FACTOR * t / S)^(DECAY)
```

Where FACTOR = 19/81 and DECAY = -0.5 (FSRS v4.5 defaults).

**FSRS v6 (latest):**
```
R(t, S) = (1 + factor * t / S)^(-w_20)
```
Where factor = 0.9^(-1/w_20) - 1.

When t = S, R = 0.90 (90%) by definition of stability.

#### Interval Calculation

```
I(R_desired, S) = (S / FACTOR) * (R_desired^(1/DECAY) - 1)
```

For the common case of desired retention = 90%, the interval equals the stability S.

#### Initial Stability (First Review)

```
S_0(G) = w_{G-1}
```

Where G is the first grade (1=Again, 2=Hard, 3=Good, 4=Easy), and w_0 through w_3 are parameters. Default values (FSRS v5): w_0=0.40, w_1=1.18, w_2=3.17, w_3=15.69.

This means: a card rated "Good" on first review gets stability of ~3.17 days.

#### Initial Difficulty

```
D_0(G) = w_4 - e^(w_5 * (G - 1)) + 1
```

Clamped to [1, 10]. Default w_4 = 7.19, w_5 = 0.53.

#### Stability After Successful Review

```
S'_r(D, S, R, G) = S * (1 + e^(w_8) * (11 - D) * S^(-w_9) * (e^(w_10 * (1-R)) - 1) * hard_penalty * easy_bonus)
```

Where:
- e^(w_8) = base growth factor
- (11 - D) = difficulty penalty (easier cards grow stability faster)
- S^(-w_9) = stability decay (cards with already-high stability grow more slowly)
- e^(w_10 * (1-R)) - 1 = retrievability bonus (reviewing when R is lower yields more stability gain)
- hard_penalty = w_15 if grade = Hard, else 1
- easy_bonus = w_16 if grade = Easy, else 1

**Key insight:** Stability can NEVER decrease after a successful review (S' >= S).

#### Stability After Failed Review (Lapse)

```
S'_f(D, S, R) = w_11 * D^(-w_12) * ((S+1)^(w_13) - 1) * e^(w_14 * (1-R))
```

With the constraint: S'_f = min(S'_f, S) -- post-lapse stability cannot exceed pre-lapse stability.

#### Difficulty Update

```
delta_D = -w_6 * (G - 3)
D' = D + delta_D * (10 - D) / 9
D'' = w_7 * D_0(4) + (1 - w_7) * D'
```

Clamped to [1, 10]. This includes "mean reversion" toward a default difficulty.

#### Default Parameters (FSRS v5, 19 parameters)

```
w = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604,
     0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605,
     2.2698, 0.2315, 2.9898, 0.51655, 0.6621]
```

#### FSRS v6 Default Parameters (21 parameters)

```
w = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001,
     1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014,
     1.8729, 0.5425, 0.0912, 0.0658, 0.1542]
```

### 4.4 Leitner System

The Leitner system (Sebastian Leitner, 1970s) is a box-based approach using fixed interval schedules.

#### Box Configuration

| Box | Review Interval | Behavior on Correct | Behavior on Incorrect |
|-----|----------------|--------------------|-----------------------|
| 1 | Every day | Move to Box 2 | Stay in Box 1 |
| 2 | Every 2 days | Move to Box 3 | Return to Box 1 |
| 3 | Every 4 days | Move to Box 4 | Return to Box 1 |
| 4 | Every 8 days | Move to Box 5 | Return to Box 1 |
| 5 | Every 16 days | Mastered / Archive | Return to Box 1 |

General formula: Interval for box n = 2^(n-1) days (geometric progression with factor 2).

Alternative: Use factor = EF (like SM-2). With EF=2: intervals are 1, 2, 4, 8, 16, 32... days.

#### Advantages
- Extremely simple to implement
- Intuitive for users
- No complex mathematics

#### Limitations
- Fixed intervals regardless of item difficulty or student performance
- No personalization
- All items in the same box are treated identically
- Binary "correct/incorrect" with no gradation

### 4.5 Half-Life Regression (HLR)

Developed by Settles & Meeder at Duolingo (2016). Combines psycholinguistic theory with machine learning.

**Key Reference:** Settles, B. & Meeder, B. (2016). "A Trainable Spaced Repetition Model for Language Learning." *Proceedings of ACL 2016*, pp. 1848-1858.

#### Core Formula

```
p = 2^(-delta / h)
```

Where:
- p = probability of recall
- delta = time since last review (in days)
- h = half-life of the memory (in days)

The "half-life" is the time at which recall probability drops to 50%.

#### Half-Life Estimation

```
h_hat = 2^(THETA . x)
```

Where:
- THETA = learned weight vector
- x = feature vector for the student-item pair
- The dot product is in the exponent of 2

#### Feature Vector Components

The feature vector x typically includes:
- Number of times the item was previously seen
- Number of correct responses
- Number of incorrect responses
- Time since last practice
- Item difficulty features
- Student-level features

#### Training Objective

Minimize a combined loss:
```
L(THETA) = SUM [(p_hat - p_actual)^2 + alpha * (h_hat - h_actual)^2 + lambda * ||THETA||^2]
```

Where alpha balances the half-life prediction loss and lambda provides L2 regularization.

#### Results from Duolingo

- 45%+ error reduction compared to baselines (Leitner, SM-2) for predicting recall rates
- 12% increase in overall daily activity engagement in A/B tests

### 4.6 Comparison of Spaced Repetition Algorithms

| Feature | SM-2 | FSRS | Leitner | HLR |
|---------|------|------|---------|-----|
| Personalization | Per-item EF | Per-item D,S,R | None | Per-item features |
| Parameters | 1 (EF) per item | 19-21 global | 0 | Feature weights |
| Optimal scheduling | No (heuristic) | Yes (memory model) | No (fixed) | Yes (memory model) |
| Forgetting model | Implicit | Explicit (power decay) | Implicit | Explicit (exponential) |
| Complexity | Very low | Medium | Very low | Medium |
| Data requirements | None (rule-based) | Review history needed for optimization | None | Training data needed |
| Research backing | Empirical (1987) | Strong (2022+) | Empirical (1970s) | Strong (2016) |

**Key References:**
- [SM-2 Algorithm (SuperMemo)](https://super-memory.com/english/ol/sm2.htm)
- [FSRS Algorithm Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)
- [FSRS Technical Explanation (Expertium)](https://expertium.github.io/Algorithm.html)
- [Implementing FSRS in 100 Lines](https://borretti.me/article/implementing-fsrs-in-100-lines)
- [Half-Life Regression (Duolingo)](https://github.com/duolingo/halflife-regression)
- [Leitner System - Wikipedia](https://en.wikipedia.org/wiki/Leitner_system)

---

## 5. Bloom's Revised Taxonomy

### 5.1 Overview

The original Bloom's Taxonomy (1956) was revised by Anderson & Krathwohl (2001) to use active verbs and to swap the top two levels. It provides a framework for classifying educational objectives and assessment questions by cognitive complexity.

**Key Reference:** Anderson, L.W. & Krathwohl, D.R. (2001). *A Taxonomy for Learning, Teaching, and Assessing.* Longman.

### 5.2 The Six Cognitive Process Levels

Listed from lowest to highest complexity:

| Level | Verb | Definition | Math Example (Grade School) |
|-------|------|------------|----------------------------|
| 1. Remember | Recall, Identify, List | Retrieve relevant knowledge from long-term memory | "What is 7 x 8?" / "What is the formula for area of a rectangle?" |
| 2. Understand | Explain, Classify, Summarize | Construct meaning from instructional messages | "Explain why 1/2 = 2/4" / "Describe what multiplication means" |
| 3. Apply | Execute, Implement, Solve | Use a procedure in a given situation | "Calculate 345 + 278" / "Find the area of a rectangle with length 5 and width 3" |
| 4. Analyze | Differentiate, Organize, Attribute | Break material into parts and determine relationships | "What is wrong with this solution: 23 x 4 = 82?" / "Which operation should you use for this word problem?" |
| 5. Evaluate | Check, Critique, Judge | Make judgments based on criteria | "Is 4/6 a simpler form of 2/3? Justify." / "Which strategy is more efficient for solving this problem?" |
| 6. Create | Generate, Plan, Produce | Put elements together to form a novel whole | "Write a word problem that uses division with remainders" / "Design a method to estimate square roots" |

### 5.3 The Four Knowledge Dimensions

| Dimension | Definition | Math Examples |
|-----------|------------|---------------|
| Factual | Basic elements, terminology, specific details | Multiplication tables, place value names, geometric shape names |
| Conceptual | Interrelationships among elements, categories, principles | Understanding that multiplication is repeated addition; fraction equivalence; properties of operations |
| Procedural | How to do something; methods, algorithms, techniques | Long division algorithm; carrying in addition; converting fractions to decimals |
| Metacognitive | Awareness of own cognition; strategic knowledge | Knowing when to estimate vs. calculate exactly; self-monitoring problem-solving strategies |

### 5.4 The Taxonomy Table (2D Framework)

The full taxonomy is a 2D matrix: Knowledge Dimension x Cognitive Process Level.

Example cells for K-12 math:

| | Remember | Understand | Apply | Analyze | Evaluate | Create |
|---|---|---|---|---|---|---|
| **Factual** | Recall 8x7=56 | Explain what 8x7 means | -- | -- | -- | -- |
| **Conceptual** | State commutative property | Explain why a*b = b*a | Identify commutative property in 3*5=5*3 | Compare distributive and commutative properties | -- | -- |
| **Procedural** | List steps for long division | Explain each step of long division | Perform long division on 456/12 | Diagnose errors in a long division solution | Judge which division method is more efficient | Invent a shortcut method |
| **Metacognitive** | -- | -- | -- | Reflect on which problem-solving strategy works best | Evaluate own understanding of fractions | Plan a study strategy for an upcoming test |

### 5.5 Mapping Question Types to Bloom's Levels

For a quiz app generating math questions, map each question to a Bloom's level:

**Level 1 - Remember:**
- Direct recall: "What is 6 x 9?"
- Identify: "Which shape is a triangle?"
- MCQ with direct factual recall

**Level 2 - Understand:**
- Interpretation: "Which picture shows 3/4?"
- Classification: "Is 7 prime or composite?"
- Explanation: "Why does 0.5 = 1/2?"

**Level 3 - Apply:**
- Standard computation: "Solve 234 - 167"
- Apply formula: "Find the perimeter of a square with side 8 cm"
- Use procedure in familiar context

**Level 4 - Analyze:**
- Word problem requiring strategy selection: "Ali has 24 candies to share equally among 6 friends. How many does each get?"
- Error analysis: "Find the mistake in: 3/4 + 1/4 = 4/8"
- Pattern recognition: "What comes next: 2, 6, 18, 54, ?"

**Level 5 - Evaluate:**
- Judgment: "Fatima says 0.3 > 0.25 because 3 > 25. Is she correct? Why?"
- Comparison: "Which method is faster for computing 99 x 5?"
- Justification: "Prove that the sum of two even numbers is always even"

**Level 6 - Create:**
- Generate: "Write a word problem that equals 3 x 12"
- Design: "Create a pattern that increases by a different amount each time"
- Open-ended: "Find as many ways as possible to make 100 using exactly 4 numbers"

### 5.6 Using Bloom's for Progression/Scaffolding

In a skill map, Bloom's levels provide a natural progression path:

```
For each KC (e.g., "Multiplication of 2-digit numbers"):
  Level 1 (Remember): Recall basic facts -> must master first
  Level 2 (Understand): Explain concepts -> builds on Level 1
  Level 3 (Apply): Standard problems -> builds on Level 2
  Level 4 (Analyze): Multi-step/word problems -> builds on Level 3
  Level 5 (Evaluate): Error finding, optimization -> builds on Level 4
  Level 6 (Create): Open-ended generation -> builds on Level 5
```

Practically, most K-12 math quiz apps focus on Levels 1-4. Levels 5-6 are harder to assess automatically (require open-ended responses or complex rubrics).

**Recommended simplification for a quiz app:**
- **Basic** = Remember + Understand (recall and comprehension)
- **Proficient** = Apply (standard problem solving)
- **Advanced** = Analyze + Evaluate (multi-step, error finding, justification)

### 5.7 Advantages and Limitations

**Advantages:**
- Universal framework applicable to any subject
- Ensures assessments cover multiple cognitive levels
- Provides clear progression structure
- Well-understood by educators globally

**Limitations:**
- Levels are not strictly hierarchical in practice (some research suggests the hierarchy is not rigid)
- Difficult to assess higher levels (5-6) with MCQ format
- Classification of questions into levels can be subjective
- Does not account for domain-specific progressions (mathematical prerequisites)

**Key References:**
- [Bloom's Taxonomy Interpreted for Mathematics (U of Toronto)](https://www.math.toronto.edu/writing/BloomsTaxonomy.pdf)
- [Bloom's Revised Taxonomy (Colorado College)](https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html)
- [Bloom's Taxonomy - Wikipedia](https://en.wikipedia.org/wiki/Bloom's_taxonomy)
- [Bloom's Taxonomy for Math (Simply Psychology)](https://www.simplypsychology.org/blooms-taxonomy.html)

---

## 6. Forgetting Curves & Retention

### 6.1 Ebbinghaus's Original Research (1885)

Hermann Ebbinghaus conducted the first systematic study of memory and forgetting using nonsense syllables. His key finding: memory decays rapidly at first, then the rate of forgetting slows down.

#### Original Forgetting Curve Data (Savings Scores)

| Time Since Learning | Retention (Savings) |
|--------------------|-------------------|
| 20 minutes | 58.2% |
| 1 hour | 44.2% |
| 9 hours | 35.8% |
| 1 day | 33.7% |
| 2 days | 27.8% |
| 6 days | 25.4% |
| 31 days | 21.1% |

**Key insight:** ~50% is lost within the first hour; ~70% within 24 hours; then decay slows dramatically.

#### Ebbinghaus's Fitted Equations

**1880 Power Function:**
```
x = [1 - (2/t)^0.099]^0.51
```
Where x = 1 - savings, t = time in minutes.

**1885 Logarithmic Function:**
```
Q(t) = 1.84 / ((log10(t))^1.25 + 1.84)
```

### 6.2 Power Law vs. Exponential Decay

This is a long-standing debate in memory research.

#### Exponential Decay Model

```
R(t) = e^(-t/S)
```

- R = retention/retrievability
- t = time since learning
- S = stability (memory strength)

Properties: Individual memories decay exponentially. Simple, analytically tractable.

#### Power Law of Forgetting

```
R(t) = a * t^(-b)
```

Or equivalently:
```
R(t) = a * (1 + c*t)^(-b)
```

Properties: When memories of different strengths/stabilities are AGGREGATED (averaged), the composite forgetting curve follows a power law even if individual curves are exponential. This is why empirical data often fits power law better -- it reflects a mixture of items with different stabilities.

**Key finding (SuperMemo/Wozniak):** Individual item forgetting is exponential; aggregate forgetting across items of mixed difficulty appears as a power law. FSRS uses a power-law variant for its forgetting curve: R(t,S) = (1 + FACTOR * t/S)^(DECAY).

#### Practical Implication for the Quiz App

For modeling individual item retention, use exponential decay with per-item stability. For modeling aggregate performance across many items, expect power-law-like behavior.

### 6.3 The Spacing Effect

**Definition:** Distributing practice over time (spaced practice) produces better long-term retention than massing practice into a single session (cramming).

**Research findings:**
- Spacing benefits are robust across age groups, including early elementary students
- Benefits extend beyond simple memorization to concept acquisition and generalization
- Optimal spacing interval increases with desired retention interval (longer test delay = longer optimal spacing)

**Rule of thumb (from Cepeda et al., 2008):**
```
Optimal spacing gap = ~10-20% of desired retention interval
```

For example, if you want students to remember for 30 days, space practice sessions 3-6 days apart.

### 6.4 The Testing Effect (Retrieval Practice)

**Definition:** The act of retrieving information from memory (being tested) strengthens that memory more than re-studying the same material.

**Research findings:**
- Testing produces 50-150% better retention than re-studying on delayed tests
- Even unsuccessful retrieval attempts enhance learning (if followed by feedback)
- The effect is larger with more difficult retrieval (desirable difficulty)

**Implication for quiz app:** The app's core activity (quizzing) is inherently beneficial for retention. Even incorrect answers followed by feedback strengthen learning. This supports the approach of frequent, low-stakes quizzing.

### 6.5 The Interleaving Effect

**Definition:** Mixing different problem types within a practice session (interleaving) produces better discrimination and long-term retention than practicing one type at a time (blocking).

**Research in mathematics specifically:**
- Rohrer (2012): "Interleaving helps students distinguish among similar mathematics problems"
- Interleaved math practice improved test scores by 25-43% compared to blocked practice
- The benefit is strongest when problem types are similar and easily confused

**Implication for quiz app:** Mix question types within review sessions. Do not drill only one skill at a time. Present a mix of addition, subtraction, multiplication problems rather than 20 addition problems in a row.

### 6.6 Factors Affecting Retention Rate

| Factor | Effect on Retention | Mechanism |
|--------|-------------------|-----------|
| Spacing | Strongly positive | Distributed encoding, varied context |
| Testing/retrieval | Strongly positive | Strengthens retrieval pathways |
| Interleaving | Moderately positive | Forces discrimination, varied context |
| Sleep | Strongly positive | Memory consolidation |
| Emotional valence | Moderate (positive and negative) | Amygdala-hippocampus interaction |
| Depth of processing | Strongly positive | Richer encoding |
| Prior knowledge | Strongly positive | Schema-based integration |
| Meaningfulness | Strongly positive | Semantic encoding > rote |

### 6.7 Modeling Retention Decay for a Student Model

**Recommended approach for the quiz app:**

For each student-skill pair, track:
- `last_review_time`: timestamp of last practice
- `stability`: estimated memory strength (in days)
- `difficulty`: inherent difficulty of the material
- `review_count`: number of times practiced

Compute current retrievability:
```
t = (now - last_review_time) in days
R = (1 + t / (9 * stability))^(-0.5)    // FSRS v4.5 formula
```

Or simpler exponential:
```
R = 0.9^(t / stability)                 // FSRS v3 formula
```

Both give R = 0.9 when t = stability (by design of stability definition).

**Key References:**
- [Replication of Ebbinghaus Forgetting Curve (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4492928/)
- [Forgetting Curve - Wikipedia](https://en.wikipedia.org/wiki/Forgetting_curve)
- [Power Law of Forgetting (Kahana)](https://memory.psych.upenn.edu/files/pubs/KahaAdle02.pdf)
- [Interleaved Practice Improves Mathematics Learning (Rohrer)](https://files.eric.ed.gov/fulltext/ED557355.pdf)
- [Spacing Effect in Children (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3399982/)

---

## 7. Zone of Proximal Development (ZPD)

### 7.1 Vygotsky's Theory

Lev Vygotsky (1978) proposed that learning occurs most effectively in the Zone of Proximal Development -- the gap between what a learner can do independently and what they can do with guidance.

Three zones:
1. **Zone of Actual Development (ZAD):** What the student can do independently. Tasks here are too easy and produce no learning.
2. **Zone of Proximal Development (ZPD):** What the student can do with assistance. This is where learning happens most effectively.
3. **Zone of Future Development:** Tasks beyond the student's current capability even with help. Tasks here are too hard and produce frustration.

### 7.2 The 85% Rule for Optimal Learning

A landmark 2019 paper by Wilson et al. in *Nature Communications* mathematically derived the optimal difficulty for learning:

**The finding:** Learning is maximized when training accuracy is approximately 85%.

```
Optimal accuracy = 85.15% (or equivalently, optimal error rate = 14.85%)
```

This was derived for stochastic gradient-descent-based learning but aligns remarkably well with educational research on desirable difficulty.

**Practical interpretation:** If a student is getting more than ~90% correct, the material is too easy (within ZAD). If getting less than ~75% correct, the material is too hard (beyond ZPD). The sweet spot for maximum learning is ~85% accuracy.

### 7.3 Operationalizing ZPD in Software

#### Approach 1: Accuracy-Based Difficulty Adjustment

```
current_accuracy = correct_responses / total_responses  (over recent window)

if current_accuracy > 0.90:
    increase_difficulty()     // Too easy, move up
elif current_accuracy < 0.75:
    decrease_difficulty()     // Too hard, move down
else:
    maintain_difficulty()     // In the ZPD sweet spot
```

#### Approach 2: BKT-Based ZPD

Using BKT mastery estimates:
- P(L) > 0.95: Mastered. Move to harder content (above ZPD).
- 0.50 < P(L) < 0.95: In ZPD. Continue practicing at this level.
- P(L) < 0.30: Below ZPD. Provide scaffolding or prerequisite review.

#### Approach 3: IRT-Based ZPD

Using IRT ability estimates:
- Select items where item difficulty b is near student ability theta
- Specifically: |theta - b| < 1.0 standard deviation
- This ensures items are challenging but achievable

#### Approach 4: Hint-Based SZPD (Murray & Arroyo)

The Specific ZPD (SZPD) framework measures ZPD by tracking the amount of help/hints a student needs:
- **H** = goal number of hints per problem
- **DH** = allowed deviation from H
- **P** = minimum problems needed for stable measurement

If student needs 0 hints consistently: above ZPD (increase difficulty)
If student needs 1-2 hints: in ZPD (optimal zone)
If student needs 3+ hints or cannot complete: below ZPD (provide prerequisite instruction)

### 7.4 Connection to Adaptive Difficulty in Math Quiz Apps

For an Arabic math quiz app:

1. **Define difficulty levels per KC:** Each knowledge component has 3-5 difficulty tiers
2. **Track rolling accuracy:** Over last 10-20 attempts per KC
3. **Target 80-90% accuracy:** Adjust difficulty tier to maintain this range
4. **Provide scaffolding in ZPD:** Hints, partial solutions, worked examples when accuracy drops below 70%
5. **Advance when above ZPD:** Move to next difficulty tier or next KC when accuracy exceeds 90% consistently

### 7.5 Advantages and Limitations

**Advantages:**
- Theoretically grounded in developmental psychology
- Intuitive for educators and parents
- Provides framework for adaptive difficulty
- Well-aligned with the 85% optimal accuracy finding

**Limitations:**
- Originally defined for social interaction (teacher-student), not software
- Vague about specifics (what constitutes "assistance"?)
- ZPD boundaries are hard to measure precisely
- Different ZPDs for different skills (multidimensional)

**Key References:**
- [The 85% Rule for Optimal Learning (Nature Communications)](https://www.nature.com/articles/s41467-019-12552-4)
- [ZPD in Adaptive Instructional Systems (Murray & Arroyo)](https://link.springer.com/chapter/10.1007/3-540-47987-2_75)
- [Zone of Proximal Development - Wikipedia](https://en.wikipedia.org/wiki/Zone_of_proximal_development)
- [ZPD Guide (Simply Psychology)](https://www.simplypsychology.org/zone-of-proximal-development.html)

---

## 8. Mastery Learning

### 8.1 Benjamin Bloom's Mastery Learning Model (1968)

Benjamin Bloom proposed that given sufficient time and appropriate instructional conditions, 95% of students can master any learning objective at a level typically achieved by only the top 5% under conventional instruction.

**Key Reference:** Bloom, B.S. (1968). "Learning for Mastery." *Evaluation Comment*, 1(2).

### 8.2 The Mastery Learning Cycle

```
1. Pre-assessment (diagnostic)
2. Instruction on the unit
3. Formative assessment
4. If mastery criterion met -> advance to next unit
5. If not met -> corrective instruction + re-assessment
6. Repeat steps 3-5 until mastery
```

### 8.3 What Threshold Constitutes "Mastery"?

Research shows varying thresholds:

| Source | Mastery Threshold | Context |
|--------|------------------|---------|
| Bloom (1968) | 80-90% on unit tests | Original proposal |
| BKT standard | P(L) >= 0.95 | Bayesian Knowledge Tracing |
| ASSISTments | 3 consecutive correct | Skill Builder feature |
| Khan Academy (legacy) | 5 consecutive correct | Mastery challenges |
| Cognitive Tutor | P(L) >= 0.95 via BKT | Carnegie Learning |
| ALEKS | Varies by topic | Adaptive system |
| Common standard | 80-90% accuracy | General education |

**Research finding from EDM:** The optimal mastery learning policy using BKT typically uses a threshold of P(L) >= 0.95. However, the N-Consecutive-Correct-in-a-Row (N-CCR) heuristic with optimal N often performs nearly as well as the BKT-based policy.

### 8.4 N-Consecutive Correct in a Row (N-CCR) Heuristic

The N-CCR heuristic requires students to answer N problems correctly in a row before moving on. This is the simplest mastery criterion.

**Characteristics:**
- Used by ASSISTments (N=3), Khan Academy (N=5, historically)
- If a student gets N-1 correct then makes an error, progress resets to 0
- This can be demotivating (one slip erases progress)

**Research findings (from "Mastery Learning Heuristics and Their Hidden Models"):**
- N-CCR is actually the optimal mastery policy for a specific BKT model variant
- When P(S) (slip) is small, N-CCR with optimal N performs nearly as well as the BKT-optimal policy
- The "hidden model" behind N-CCR assumes no forgetting and binary knowledge state

**Recommended N values based on research:**

| N | When to Use | Properties |
|---|------------|------------|
| 2 | Very easy skills, young children | Fast but high false-positive rate |
| 3 | Standard practice (ASSISTments default) | Good balance for most skills |
| 4-5 | Important prerequisite skills, high-stakes | More conservative, fewer false positives |
| 5+ | Only for critical foundational skills | Can be demotivating |

**Minimum practice opportunities:** Research suggests a minimum of 7 opportunities per KC for stable assessment.

### 8.5 BKT-Based Mastery Criterion

```
if P(L_n) >= 0.95:
    declare mastery
```

This is more nuanced than N-CCR because:
- A correct answer after many failures raises P(L) less than after consistent correctness
- The model accounts for guessing and slipping
- Different skills can reach mastery after different numbers of practice opportunities

### 8.6 Mastery vs. Performance Distinction

**Performance** = what a student does in the moment (observable)
**Mastery/Learning** = what a student knows (latent, must be inferred)

Key implications:
- A student can perform correctly by guessing (P(G)) without mastery
- A student can fail despite mastery (P(S) -- slip)
- Short-term performance (blocked practice) often overestimates mastery
- Long-term retention on delayed tests is a better indicator of true mastery
- The spacing and testing effects suggest that harder practice (lower immediate performance) leads to better long-term mastery

### 8.7 Mastery Learning and Forgetting

A critical finding from research using the ALEKS system: while higher mastery thresholds are initially associated with better retention, after several weeks the difference has largely disappeared. This suggests that:

1. Very high mastery thresholds (e.g., 95%) may not be worth the extra practice time
2. Spaced review is more important than initial mastery threshold for long-term retention
3. A moderate mastery threshold (80-85%) combined with spaced review is likely more effective than a very high initial threshold without review

### 8.8 Application to K-12 Math Quiz App

**Recommended mastery system:**

1. **Primary criterion:** BKT P(L) >= 0.85 (slightly lower than traditional 0.95 to reduce student frustration, compensated by spaced review)
2. **Minimum attempts:** At least 5 attempts before declaring mastery (avoid lucky streaks)
3. **Simple fallback (no BKT data):** 3 consecutive correct answers
4. **Post-mastery review:** Schedule spaced reviews using SM-2 or FSRS even after mastery is declared
5. **Mastery decay:** If a student fails a review after mastery, partially reduce mastery status and schedule more frequent reviews

**Key References:**
- [Mastery Learning - Wikipedia](https://en.wikipedia.org/wiki/Mastery_learning)
- [Mastery Learning Heuristics and Their Hidden Models (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7334722/)
- [Defining Mastery: BKT vs N-CCR (EDM 2015)](https://www.educationaldatamining.org/EDM2015/uploads/papers/paper_311.pdf)
- [How Much Mastery is Enough Mastery (EDM 2025)](https://educationaldatamining.org/edm2025/proceedings/2025.EDM.short-papers.4/2025.EDM.short-papers.4.pdf)
- [Bloom's Original "Learning for Mastery" (ERIC)](https://eric.ed.gov/?id=ED053419)
- [Closing Achievement Gaps: Revisiting Bloom's Mastery Learning (Guskey)](https://tguskey.com/wp-content/uploads/Mastery-Learning-5-Revisiting-Blooms-Learning-for-Mastery.pdf)

---

## 9. Synthesis: Recommendations for the Skill Map Module

### 9.1 Architecture Overview

Based on the research above, here is a recommended architecture for the skill map module:

```
+------------------+     +-------------------+     +------------------+
| Knowledge Model  | --> | Scheduling Engine | --> | Presentation     |
| (BKT / PFA)      |     | (Spaced Rep)      |     | (Bloom's Levels) |
+------------------+     +-------------------+     +------------------+
        |                         |                         |
        v                         v                         v
  Student mastery         When to review            What to show
  per skill               each skill                (difficulty tier)
```

### 9.2 Recommended Model Choices

| Component | Recommended Approach | Rationale |
|-----------|---------------------|-----------|
| Knowledge Tracing | Simplified BKT | Interpretable, well-studied, maps to quiz format |
| Spaced Repetition | SM-2 (start) or FSRS (advanced) | SM-2 is simple and proven; FSRS is more accurate but complex |
| Difficulty Model | Bloom's 3-tier (Basic/Proficient/Advanced) | Simple enough for implementation, maps to textbook structure |
| Mastery Criterion | P(L) >= 0.85 with min 5 attempts | Balances accuracy with student motivation |
| Adaptive Difficulty | Target 80-85% accuracy (ZPD) | Aligns with 85% optimal learning rule |
| Forgetting Model | Exponential decay: R = 0.9^(t/S) | Simple, well-validated |

### 9.3 Recommended Default Parameters

#### BKT Parameters (per skill, for 4-choice MCQ)

```
P(L0) = 0.10    // 10% initial knowledge probability
P(T)  = 0.20    // 20% learn rate per attempt
P(G)  = 0.25    // 25% guess rate (4-choice MCQ)
P(S)  = 0.05    // 5% slip rate
Mastery threshold = 0.85
```

#### SM-2 Parameters (for review scheduling)

```
Initial EF = 2.5
Minimum EF = 1.3
I(1) = 1 day
I(2) = 6 days (or 3 days for K-3 students)
I(n) = I(n-1) * EF for n > 2
Quality mapping: correct with confidence -> 5, correct -> 4, correct with difficulty -> 3, incorrect -> 1
```

#### Simplified FSRS Parameters (if using FSRS)

```
Use default w parameters from FSRS v5
Desired retention = 0.90 (90%)
Initial stability: Again=0.4, Hard=1.2, Good=3.2, Easy=15.7 days
```

#### Forgetting Curve Parameters

```
R(t) = 0.9^(t / stability)
Initial stability = 1 day (new items)
Stability increases with each successful review
Review trigger: when R drops below 0.85 (85% retrievability)
```

### 9.4 Skill Map Structure Recommendation

```
Grade Level (e.g., Grade 3)
  |
  +-- Unit (e.g., "Multiplication")
       |
       +-- Skill / KC (e.g., "Multiply 1-digit by 1-digit")
            |
            +-- Bloom's Level 1 (Remember): Recall multiplication facts
            +-- Bloom's Level 2 (Understand): Explain what multiplication means
            +-- Bloom's Level 3 (Apply): Solve standard multiplication problems
            +-- Bloom's Level 4 (Analyze): Word problems requiring multiplication
            |
            Mastery state per level: {not_started, learning, mastered, needs_review}
            BKT state: P(L), attempt_count, success_count, failure_count
            SRS state: next_review_date, stability, easiness_factor
```

### 9.5 Student State Data Model

For each student-skill pair, maintain:

```
{
  skill_id: string,
  bloom_level: 1-6,

  // BKT state
  p_mastery: float,       // Current P(L), range [0, 1]
  is_mastered: boolean,   // P(L) >= 0.85 and attempts >= 5
  attempt_count: int,
  success_count: int,
  failure_count: int,
  consecutive_correct: int,

  // SRS state
  last_review_date: timestamp,
  next_review_date: timestamp,
  stability: float,       // Memory strength in days
  easiness_factor: float, // SM-2 EF, default 2.5, min 1.3
  interval: float,        // Current review interval in days
  repetition_number: int,

  // Forgetting
  current_retrievability: float,  // Computed: 0.9^(days_since_review / stability)

  // Difficulty tracking
  recent_accuracy: float,  // Rolling accuracy over last 10 attempts
}
```

### 9.6 Decision Flow for Each Student Interaction

```
1. Student opens app
2. For each skill, compute current retrievability:
   R = 0.9^(days_since_review / stability)
3. Prioritize skills for review:
   a. Skills where R < 0.85 (due for review, sorted by lowest R first)
   b. Skills in learning state (not yet mastered)
   c. New skills (following prerequisite chain)
4. Select a skill to practice
5. Select difficulty tier based on ZPD:
   - If recent_accuracy > 0.90: increase Bloom's level
   - If recent_accuracy < 0.75: decrease Bloom's level or provide hints
   - Otherwise: maintain current level
6. Present question
7. Record response (correct/incorrect)
8. Update BKT:
   - Apply Bayes update (correct or incorrect formula)
   - Apply transition update
   - Check mastery criterion
9. Update SRS:
   - If correct: advance interval (SM-2 rules), increase stability
   - If incorrect: reset interval to 1 day, reduce stability
   - Update easiness factor
10. Schedule next review date
```

### 9.7 Key Tradeoffs and Simplification Options

If the full system is too complex, here are simplification tiers:

**Tier 1 (Minimum Viable):**
- Track success/failure counts per skill
- Use N-CCR (3 correct in a row) for mastery
- Use Leitner boxes (5 boxes) for review scheduling
- No forgetting model

**Tier 2 (Recommended):**
- BKT with default parameters for mastery tracking
- SM-2 for review scheduling
- Exponential forgetting curve for review prioritization
- 3-tier Bloom's difficulty (Basic/Proficient/Advanced)
- Target 85% accuracy for difficulty adjustment

**Tier 3 (Advanced):**
- BKT with per-skill parameter fitting (requires data)
- FSRS for optimized scheduling
- IRT-calibrated item difficulties
- Full Bloom's 6-level progression
- Half-life regression for personalized forgetting curves

### 9.8 Key Mathematical Formulas Summary

| Purpose | Formula | Variables |
|---------|---------|-----------|
| BKT Update (correct) | P(L\|c) = P(L)(1-P(S)) / [P(L)(1-P(S)) + (1-P(L))P(G)] | L=mastery, S=slip, G=guess |
| BKT Update (incorrect) | P(L\|w) = P(L)P(S) / [P(L)P(S) + (1-P(L))(1-P(G))] | Same as above |
| BKT Transition | P(L_{n+1}) = P(L_n\|obs) + (1-P(L_n\|obs))P(T) | T=transition/learn rate |
| PFA Logit | m = beta + gamma*s + rho*f | beta=difficulty, gamma/rho=learning rates, s/f=counts |
| PFA Probability | P = 1/(1+e^(-m)) | m=logit from above |
| IRT 3PL | P = c + (1-c)/(1+e^(-a(theta-b))) | a=discrimination, b=difficulty, c=guess, theta=ability |
| SM-2 Interval | I(n) = I(n-1) * EF | EF=easiness factor |
| SM-2 EF Update | EF' = EF + 0.1 - (5-q)(0.08 + (5-q)*0.02) | q=quality rating 0-5 |
| Forgetting (exp) | R = e^(-t/S) | t=time, S=stability |
| Forgetting (FSRS) | R = (1 + FACTOR*t/S)^(DECAY) | FACTOR=19/81, DECAY=-0.5 |
| FSRS Interval | I = (S/FACTOR)(R_d^(1/DECAY) - 1) | R_d=desired retention |
| HLR Recall | p = 2^(-delta/h) | delta=time since review, h=half-life |
| Optimal Accuracy | ~85% | Target for ZPD-aligned difficulty |

---

## References (Complete)

### Bayesian Knowledge Tracing
1. Corbett, A.T. & Anderson, J.R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction*, 4(4), 253-278.
2. Van de Sande, B. (2013). Properties of the Bayesian Knowledge Tracing Model. *JEDM*. [PDF](https://files.eric.ed.gov/fulltext/EJ1115329.pdf)
3. Baker, R.S. et al. (2008). Learning Bayesian Knowledge Tracing Parameters with a Knowledge Heuristic. [PDF](https://learninganalytics.upenn.edu/ryanbaker/paper_143.pdf)
4. pyBKT Library. [PyPI](https://pypi.org/project/pyBKT/1.1.1/)

### Performance Factors Analysis
5. Pavlik, P.I., Cen, H., & Koedinger, K.R. (2009). Performance Factors Analysis -- A New Alternative to Knowledge Tracing. *AIED 2009*. [PDF](https://pact.cs.cmu.edu/koedinger/pubs/AIED%202009%20final%20Pavlik%20Cen%20Keodinger%20corrected.pdf)
6. Logistic Knowledge Tracing Tutorial. [Web](https://yilinl.quarto.pub/pfa/)

### Item Response Theory
7. Item Response Theory. [Wikipedia](https://en.wikipedia.org/wiki/Item_response_theory)
8. Logistic IRT Models Tutorial (Penn State). [Web](https://quantdev.ssri.psu.edu/sites/qdev/files/IRT_tutorial_FA17_2.html)
9. Thompson, N.A. (2009). Ability Estimation with Item Response Theory. [PDF](https://assess.com/docs/Thompson_(2009)_-_Ability_estimation_with_IRT.pdf)

### Spaced Repetition
10. Wozniak, P. (1990). SM-2 Algorithm. [SuperMemo](https://super-memory.com/english/ol/sm2.htm)
11. Ye, J. et al. FSRS Algorithm. [GitHub Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)
12. Expertium. Technical Explanation of FSRS. [Blog](https://expertium.github.io/Algorithm.html)
13. Borretti, F. Implementing FSRS in 100 Lines. [Web](https://borretti.me/article/implementing-fsrs-in-100-lines)
14. Settles, B. & Meeder, B. (2016). A Trainable Spaced Repetition Model for Language Learning. *ACL 2016*. [GitHub](https://github.com/duolingo/halflife-regression)
15. Leitner System. [Wikipedia](https://en.wikipedia.org/wiki/Leitner_system)

### Bloom's Taxonomy
16. Anderson, L.W. & Krathwohl, D.R. (2001). *A Taxonomy for Learning, Teaching, and Assessing.* Longman.
17. Shorser, L. Bloom's Taxonomy Interpreted for Mathematics. [U of Toronto](https://www.math.toronto.edu/writing/BloomsTaxonomy.pdf)
18. Bloom's Revised Taxonomy. [Colorado College](https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html)

### Forgetting Curves
19. Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology.*
20. Murre, J.M.J. & Dros, J. (2015). Replication and Analysis of Ebbinghaus' Forgetting Curve. *PLOS ONE*. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4492928/)
21. Kahana, M.J. & Adler, M. (2002). Note on the power law of forgetting. [PDF](https://memory.psych.upenn.edu/files/pubs/KahaAdle02.pdf)
22. Rohrer, D. (2012). Interleaving helps students distinguish among similar mathematics problems. [ERIC](https://files.eric.ed.gov/fulltext/ED536926.pdf)

### Zone of Proximal Development
23. Vygotsky, L.S. (1978). *Mind in Society.* Harvard University Press.
24. Wilson, R.C. et al. (2019). The Eighty Five Percent Rule for Optimal Learning. *Nature Communications*. [DOI](https://www.nature.com/articles/s41467-019-12552-4)
25. Murray, T. & Arroyo, I. (2002). Toward Measuring and Maintaining the Zone of Proximal Development in Adaptive Instructional Systems. [Springer](https://link.springer.com/chapter/10.1007/3-540-47987-2_75)

### Mastery Learning
26. Bloom, B.S. (1968). Learning for Mastery. *Evaluation Comment*, 1(2). [ERIC](https://eric.ed.gov/?id=ED053419)
27. Guskey, T.R. (2007). Closing Achievement Gaps: Revisiting Benjamin S. Bloom's "Learning for Mastery." [PDF](https://tguskey.com/wp-content/uploads/Mastery-Learning-5-Revisiting-Blooms-Learning-for-Mastery.pdf)
28. Lee, J.I. & Brunskill, E. (2020). Mastery Learning Heuristics and Their Hidden Models. *JEDM*. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7334722/)
29. Defining Mastery: Knowledge Tracing Versus N-Consecutive Correct Responses. *EDM 2015*. [PDF](https://www.educationaldatamining.org/EDM2015/uploads/papers/paper_311.pdf)
