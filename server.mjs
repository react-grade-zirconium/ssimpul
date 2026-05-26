import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'text is required' });

    if (!client) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is missing',
        summary_points: [],
        questions: []
      });
    }

    const prompt = `다음 학습 텍스트를 분석해서 JSON만 반환하세요.\n요구 형식: {"summary_points": string[3], "questions": string[5]}\n조건: summary_points는 핵심 3개, questions는 복습용 문제 5개(한국어).\n\n텍스트:\n${text}`;

    const response = await client.responses.create({
      model: 'gpt-5-mini',
      input: prompt,
      text: {
        format: {
          type: 'json_schema',
          name: 'study_coach',
          schema: {
            type: 'object',
            properties: {
              summary_points: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
              questions: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 }
            },
            required: ['summary_points', 'questions'],
            additionalProperties: false
          }
        }
      }
    });

    const out = JSON.parse(response.output_text || '{}');
    return res.json({
      summary_points: Array.isArray(out.summary_points) ? out.summary_points.slice(0, 3) : [],
      questions: Array.isArray(out.questions) ? out.questions.slice(0, 5) : []
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'analyze failed', summary_points: [], questions: [] });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`);
});
