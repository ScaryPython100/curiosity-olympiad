# Curiosity Telemetry Indicators & Experiential Scoring Framework

> **Agastya "Aah! Aha! Ha-ha!" Philosophy Integration**
> The Curiosity Olympiad platform prioritizes experiential discovery and active inquiry over static memorization. This document specifies the internal telemetry indicators captured by `useTelemetry` within the `SandboxEngine` and practice assessment labs.

---

## 1. Core Telemetry Metrics (`TelemetryData`)

The `useTelemetry` hook captures seven primary behavioral metrics during student interaction with physics and chemistry simulations:

| Metric | Type | Description | Scientific / Educational Significance |
| :--- | :--- | :--- | :--- |
| `clickCount` | `number` | Total number of discrete click events within the workspace | Measures initial tactile curiosity and UI exploration frequency. |
| `dragCount` | `number` | Total number of drag operations (position manipulations) | Quantifies active hands-on spatial manipulation of experimental variables (e.g., moving prism, adjusting moon orbit, dropping chemical reagents). |
| `totalDwellTime` | `number` (ms) | Total cumulative duration of active interaction | Evaluates overall engagement span within a simulation level. |
| `averageDwellTime` | `number` (ms) | Average time interval between consecutive actions | Differentiates between rapid trial-and-error guessing and contemplative, methodical scientific observation. |
| `reversals` | `number` | Count of opposing or reciprocating actions within <2000ms | **Primary indicator of Hypothesis Testing**: Detects when a student tests a boundary condition by moving an object back and forth or toggling a parameter to observe differential effects. |
| `optionalActions` | `number` | Count of optional diagnostic tool toggles | **Primary indicator of Autonomous Exploration**: Captures unprompted use of advanced tools (e.g., Red Glass Filter, Force Vector Overlays, Platinum Catalyst addition). |
| `tabSwitches` | `number` | Count of browser visibility changes (`document.hidden`) | Used for proctoring and integrity monitoring during official Olympiad sessions. |

---

## 2. Interactive Simulation Parameter Actions

In addition to core metrics, each simulation module records detailed parameter telemetry when students adjust continuous or discrete sliders:

### Optics & Refraction Module
* `changed_refractive_index`: Tracked when the student adjusts the refractive index slider ($n = 1.0 \rightarrow 2.0$). Indicates investigation of optical dispersion laws.
* `changed_beam_intensity`: Tracked when beam opacity/brightness is modified ($20\% \rightarrow 100\%$).
* `changed_slit_width`: Tracked when selecting $1\text{mm}$, $2\text{mm}$, or $5\text{mm}$ apertures to observe beam collimation and edge diffraction.
* `optional_tool_used`: Triggered when toggling the Red Glass spectral filter.

### Orbital Gravity & Kepler Module
* `changed_attractor_mass`: Tracked when adjusting the central body mass ($0.5\times \rightarrow 3.0\times$ Solar Mass).
* `changed_launch_speed`: Tracked when modifying the tangential velocity of the Moon ($100 \rightarrow 500\text{ m/s}$).
* `optional_tool_used`: Triggered when toggling Force Vector trajectory predictions.

### Chemical Ecosystems Module
* `changed_temperature`: Tracked when altering the thermal energy slider ($0^\circ\text{C} \rightarrow 100^\circ\text{C}$). Detects understanding of thermal activation energy.
* `changed_stir_speed`: Tracked when modifying mechanical agitation ($0 \rightarrow 10\text{ RPM}$).
* `toggled_catalyst`: Tracked when introducing the Platinum (`Pt`) catalyst to lower activation energy.
* `optional_tool_used`: Triggered when using the "Flush System" beaker reset.

---

## 3. Curiosity Index Scoring Formula

At the end of each simulation experiment, raw telemetry is synthesized into a normalized **Curiosity Score (out of 10)**:

```typescript
const calculateLevelScore = (telemetry: TelemetryData) => {
  const baseScore = 5;
  const clickBonus = Math.min(2, telemetry.clickCount * 0.2);
  const reversalBonus = Math.min(2, telemetry.reversals * 0.5);
  const optionalBonus = telemetry.optionalActions > 0 ? 1 : 0;
  
  return Math.min(10, baseScore + clickBonus + reversalBonus + optionalBonus);
};
```

### Scoring Breakdown:
1. **Base Engagement (5.0 Points)**: Awarded for launching and participating in the simulation.
2. **Tactile Exploration Bonus (up to 2.0 Points)**: Scaled by active interaction frequency (`clickCount * 0.2`).
3. **Hypothesis Testing Bonus (up to 2.0 Points)**: High weighting assigned to experimental reversals (`reversals * 0.5`), encouraging iterative comparative testing.
4. **Autonomous Inquiry Bonus (1.0 Point)**: Granted for exploring optional diagnostic tools without explicit instruction.

---

## 4. xAPI / Telemetry Standard Payload Export

Upon assessment submission, the telemetry history is packaged into an xAPI-compliant statement payload and broadcast to the parent frame:

```json
{
  "statement": {
    "verb": { "display": { "en-US": "completed" } },
    "result": {
      "score": {
        "raw": 9,
        "max": 10
      }
    },
    "extensions": {
      "http://telemetry.org": [
        {
          "level": "optics",
          "clickCount": 12,
          "reversals": 4,
          "optionalActions": 2,
          "tabSwitches": 0
        }
      ]
    }
  }
}
```

---

## 5. Privacy & Data Governance Note
All telemetry indicators are anonymized and bound exclusively to the student's unique user ID and public nickname. Real names (stored in `student_profiles`) are strictly isolated and never transmitted in raw telemetry payloads.
