import type { SignalId } from "./types";

/** Official Jev Score schema: type, instructions, ordered criteria string array. */
export type ScoreQuestion = { type: "score"; instructions: string; criteria: string[] };

export const QUESTIONS: Record<SignalId, ScoreQuestion> = {
  repetition: {
    type: "score",
    instructions: "Evaluate only the manuscript. How strongly does the passage repeat the same information, emotion, judgment, or conclusion by rephrasing it without adding meaningful new content? Do not penalize intentional repetition that clearly serves emphasis, rhythm, comedy, tension, or characterization.",
    criteria: [
      "Each sentence or paragraph mostly adds new information, action, emotion, or perspective. No meaningful redundant restatement is present.",
      "There is a small amount of natural reiteration, but it functions as emphasis or transition and does not slow the passage.",
      "One or two ideas, emotions, or facts are noticeably restated in different wording without much new information.",
      "Several parts repeatedly restate information or emotional conclusions the reader already received, noticeably slowing the scene.",
      "Redundant restatement dominates the passage. The same facts, emotions, interpretations, or conclusions are repeatedly rephrased with little new content.",
    ],
  },
  over_explanation: {
    type: "score",
    instructions: "Evaluate only the manuscript. How strongly does the narration explain meanings, motives, emotions, or conclusions that the reader can already infer from actions, dialogue, or context? Also detect explicit wrap-up or conclusion sentences that simply restate what the scene has already shown. Do not penalize exposition that provides genuinely new and necessary information.",
    criteria: [
      "Actions, dialogue, and details carry the meaning without redundant interpretation or summarization.",
      "There is occasional explanation, but it adds useful context rather than repeating an obvious implication.",
      "The narration sometimes explains emotions, motives, or implications that the reader could already infer, or adds unnecessary summary sentences after scene beats.",
      "The narration repeatedly interprets what actions or dialogue mean and frequently states conclusions after they are already apparent.",
      "The passage persistently explains emotional or narrative implications and repeatedly closes moments with explicit summaries or conclusions.",
    ],
  },
  dialogue_explanation: {
    type: "score",
    instructions: "Evaluate only the manuscript. After dialogue exchanges, how often does the narration unnecessarily explain, translate, summarize, or restate what the characters have just communicated? Do not penalize narration that adds new action, hidden motive, contradiction, subtext, or information that was not already obvious from the dialogue.",
    criteria: [
      "Dialogue is generally allowed to stand on its own. Following narration adds new action, subtext, or context rather than restating it.",
      "A small amount of clarification follows dialogue, but it is brief and useful.",
      "Several dialogue exchanges are followed by narration that explains meaning or emotion already reasonably clear from the dialogue.",
      "Many dialogue exchanges are followed by redundant interpretation, creating a noticeable dialogue-then-explanation pattern.",
      "The passage repeatedly uses dialogue ping-pong followed by narration explaining the same meaning again, and this pattern dominates the scene.",
    ],
  },
  sentence_rhythm: {
    type: "score",
    instructions: "Evaluate only the manuscript. How much does the sentence construction feel mechanically repetitive or unnaturally arranged? Consider long runs of similar declarative sentence endings, repeated Korean endings such as 했다 / 였다 / 말했다, overly mechanical short sentences, forced inversion, and unnatural Korean word order. Do not penalize short staccato prose or inversion when it is clearly intentional and effective.",
    criteria: [
      "Sentence lengths, endings, and word order feel natural and sufficiently varied for the scene.",
      "There is a brief run of similar endings or slightly awkward word order, but the reading flow remains natural.",
      "Repeated sentence endings or occasional unnatural inversion become noticeable and make parts of the prose feel mechanical.",
      "The passage frequently relies on the same sentence-ending rhythm or strained inversion, noticeably reducing natural flow.",
      "Mechanical repeated endings, choppy declarative patterns, or forced word order dominate the passage and strongly interfere with prose rhythm.",
    ],
  },
  emotion_thinness: {
    type: "score",
    instructions: "Evaluate only the manuscript. How strongly does the passage prioritize event reporting or information delivery while giving too little character-level emotional experience where an emotional response would reasonably be expected? Consider internal thoughts, bodily reactions, hesitation, contradictory feelings, choices, sensory focus, and emotional behavior. Respect the POV. Do not penalize intentionally restrained characters merely because their emotions are subtle.",
    criteria: [
      "Character reactions are sufficiently embodied through thought, sensation, behavior, choices, or meaningful restraint. Emotional experience fits the scene.",
      "The emotional layer is generally present, with only a few moments that feel more informational than experiential.",
      "Events and information sometimes move ahead of the character's felt response. Emotions are more often named or implied than experienced.",
      "The passage is largely event- or information-driven, while important developments receive limited internal, physical, or behavioral emotional response.",
      "The passage reads primarily as event reporting or information transfer even where strong character reactions would normally be expected. The viewpoint feels emotionally hollow.",
    ],
  },
  voice_inconsistency: {
    type: "score",
    instructions: "Evaluate the internal consistency of character speech and narrative voice in the manuscript. If character notes are provided, use them as additional context. Look for unexplained changes in vocabulary, politeness level, age or social register, formality, personality, narrative tone, and character speaking style. If no character notes are supplied, judge only inconsistencies observable inside the submitted manuscript.",
    criteria: [
      "Speech and narrative voice remain internally consistent with the available context.",
      "One minor expression or tonal shift feels slightly unusual, but character identity and narrative voice remain clear.",
      "A few lines use noticeably different vocabulary, register, politeness, or tone without an obvious contextual reason.",
      "Multiple speech or narration segments shift voice enough that the character or narrator feels inconsistent.",
      "Voice inconsistency is pervasive. Many lines feel as though they could belong to a different character or tone, or repeatedly conflict with the supplied character context.",
    ],
  },
};
