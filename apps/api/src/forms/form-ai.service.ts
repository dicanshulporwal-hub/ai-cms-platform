import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AI_PROVIDER_CLIENT, AiProvider } from '../ai/providers/ai-provider.interface';

@Injectable()
export class FormAIService {
  constructor(
    @Inject(AI_PROVIDER_CLIENT) private readonly aiProvider: AiProvider,
    private readonly prisma: PrismaService,
  ) {}

  async generateForm(dto: { formPurpose: string; formType?: string; targetAudience?: string; language?: string; additionalInstructions?: string }, user: AuthenticatedUser) {
    const systemPrompt = `You are a form builder assistant. Generate a form structure as JSON.
Return ONLY valid JSON with these keys:
{"title":"","description":"","formType":"","successMessage":"","submitButtonLabel":"","fields":[{"fieldKey":"","label":"","placeholder":"","helpText":"","fieldType":"TEXT|TEXTAREA|EMAIL|PHONE|NUMBER|DATE|SELECT|RADIO|CHECKBOX|CONSENT","isRequired":true,"validation":{},"options":[]}]}
Rules:
- fieldKey must be snake_case
- Include appropriate validation
- Add consent/privacy field if collecting personal data
- Keep fields practical and minimal`;

    const userPrompt = `Purpose: ${dto.formPurpose}\nType: ${dto.formType ?? 'CUSTOM'}\nAudience: ${dto.targetAudience ?? 'General'}\nLanguage: ${dto.language ?? 'English'}${dto.additionalInstructions ? `\nAdditional: ${dto.additionalInstructions}` : ''}`;

    const result = await this.aiProvider.generateText({ systemPrompt, userPrompt });

    let parsed: Record<string, unknown>;
    try {
      const fenceMatch = result.result.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = fenceMatch ? fenceMatch[1].trim() : result.result;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch { parsed = {}; }

    await this.prisma.aIUsageLog.create({
      data: { action: 'form-generation', feature: 'form-generation', provider: result.metadata.provider, model: result.metadata.model, modelName: result.metadata.model, promptSummary: `Form: ${dto.formPurpose}`.slice(0, 500), tokenInput: result.metadata.tokenInput ?? 0, tokenOutput: result.metadata.tokenOutput ?? 0, promptTokens: result.metadata.tokenInput ?? 0, completionTokens: result.metadata.tokenOutput ?? 0, totalTokens: (result.metadata.tokenInput ?? 0) + (result.metadata.tokenOutput ?? 0), userId: user.id },
    });

    return { generated: parsed, provider: result.metadata.provider, model: result.metadata.model };
  }
}
