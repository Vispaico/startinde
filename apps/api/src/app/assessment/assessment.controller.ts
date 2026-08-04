import { Body, Controller, Post } from '@nestjs/common';
import { AssessmentService, type AssessmentInput } from './assessment.service';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  evaluate(@Body() input: AssessmentInput) {
    return {
      disclaimer:
        'Based on the information supplied, this pathway may be relevant. The official authority makes the final determination.',
      results: this.assessmentService.evaluate(input),
    };
  }
}
