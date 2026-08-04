import { Injectable } from '@nestjs/common';
import {
  combineResults,
  evaluateLanguageLevel,
  evaluateQualificationRecognition,
  evaluateSalaryRequirement,
  type RuleResult,
} from '@startinde/rules';

export interface AssessmentInput {
  goal: string;
  nationality: string;
  countryOfResidence: string;
  highestQualification: string;
  profession: string;
  yearsOfExperience: number;
  hasJobOffer: boolean;
  hasUniversityAdmission: boolean;
  offeredSalary: number | null;
  germanLevel: string;
  englishLevel: string;
  intendedArrivalDate: string;
  movingAlone: boolean;
}

export interface PathwayResult {
  pathway: string;
  slug: string;
  status: RuleResult['status'];
  readiness: { met: number; total: number };
  blockers: RuleResult[];
  ruleResults: RuleResult[];
  alternativePathway: string | null;
  nextAction: string;
}

/**
 * Phase 1 v1 pathway set (SPEC §3A): university study, Ausbildung,
 * skilled worker, EU Blue Card, Opportunity Card, post-study employment.
 * Deterministic evaluation — never a visa verdict, 4-status semantics.
 */
@Injectable()
export class AssessmentService {
  private readonly BLUE_CARD_SALARY_2026 = 48_300; // general threshold, EUR/yr (2026)
  private readonly SKILLED_WORKER_SALARY_2026 = 45_300; // EUR/yr (2026, indicative)

  evaluate(input: AssessmentInput): PathwayResult[] {
    const results: PathwayResult[] = [];
    const nationalityIsEu = input.nationality === 'Germany' || input.nationality === 'EU';

    // --- University study ---
    if (input.goal === 'study' || input.goal === 'university') {
      const rules: RuleResult[] = [
        evaluateQualificationRecognition(
          input.highestQualification !== '' ? true : null,
          ['anabin', 'uni-assist'],
        ),
        evaluateLanguageLevel(input.germanLevel, 'B1', ['daad']),
        input.hasUniversityAdmission
          ? { status: 'met', reason: 'University admission confirmed.', evidence: [], sourceIds: ['uni-assist'] }
          : { status: 'unknown', reason: 'University admission not yet confirmed.', evidence: [], sourceIds: ['uni-assist'] },
      ];
      results.push({
        pathway: 'University Study',
        slug: 'university-study',
        status: combineResults(rules, 'University Study').status,
        readiness: { met: combineResults(rules, 'University Study').met, total: rules.length },
        blockers: combineResults(rules, 'University Study').blockers,
        ruleResults: rules,
        alternativePathway: 'Opportunity Card',
        nextAction: 'Check university admission requirements and German language requirements.',
      });
    }

    // --- Ausbildung ---
    if (input.goal === 'ausbildung' || input.goal === 'vocational') {
      const rules: RuleResult[] = [
        evaluateLanguageLevel(input.germanLevel, 'B1', ['make-it-in-germany']),
        input.hasJobOffer
          ? { status: 'met', reason: 'Training contract in place.', evidence: [], sourceIds: ['make-it-in-germany'] }
          : { status: 'unknown', reason: 'No training contract yet — employer search required.', evidence: [], sourceIds: ['make-it-in-germany'] },
      ];
      results.push({
        pathway: 'Ausbildung (Vocational Training)',
        slug: 'ausbildung',
        status: combineResults(rules, 'Ausbildung').status,
        readiness: { met: combineResults(rules, 'Ausbildung').met, total: rules.length },
        blockers: combineResults(rules, 'Ausbildung').blockers,
        ruleResults: rules,
        alternativePathway: 'Opportunity Card',
        nextAction: 'Start employer search and verify language requirements for your trade.',
      });
    }

    // --- Skilled worker / EU Blue Card / Opportunity Card ---
    if (['work', 'bluecard', 'job'].includes(input.goal)) {
      const salaryRules: RuleResult[] = [
        evaluateSalaryRequirement(input.offeredSalary, this.BLUE_CARD_SALARY_2026, ['make-it-in-germany']),
        evaluateQualificationRecognition(input.highestQualification !== '' ? true : null, ['anabin']),
        evaluateLanguageLevel(input.germanLevel, 'A1', ['make-it-in-germany']),
        input.hasJobOffer
          ? { status: 'met', reason: 'Qualifying employment offer present.', evidence: [], sourceIds: ['make-it-in-germany'] }
          : { status: 'unknown', reason: 'No employment offer yet.', evidence: [], sourceIds: ['make-it-in-germany'] },
      ];
      const combined = combineResults(salaryRules, 'EU Blue Card');
      results.push({
        pathway: 'EU Blue Card',
        slug: 'eu-blue-card',
        status: combined.status,
        readiness: { met: combined.met, total: salaryRules.length },
        blockers: combined.blockers,
        ruleResults: salaryRules,
        alternativePathway: 'Skilled Worker Residence Permit',
        nextAction: 'Verify qualification recognition and salary threshold against the latest official guidance.',
      });

      const skilledRules: RuleResult[] = [
        evaluateSalaryRequirement(input.offeredSalary, this.SKILLED_WORKER_SALARY_2026, ['make-it-in-germany']),
        evaluateQualificationRecognition(input.highestQualification !== '' ? true : null, ['anabin']),
        input.hasJobOffer
          ? { status: 'met', reason: 'Qualifying employment offer present.', evidence: [], sourceIds: ['make-it-in-germany'] }
          : { status: 'unknown', reason: 'No employment offer yet.', evidence: [], sourceIds: ['make-it-in-germany'] },
      ];
      const skilledCombined = combineResults(skilledRules, 'Skilled Worker');
      results.push({
        pathway: 'Skilled Worker Residence Permit',
        slug: 'skilled-worker',
        status: skilledCombined.status,
        readiness: { met: skilledCombined.met, total: skilledRules.length },
        blockers: skilledCombined.blockers,
        ruleResults: skilledRules,
        alternativePathway: 'Opportunity Card',
        nextAction: 'Check whether your qualification is recognised in Germany.',
      });

      if (!input.hasJobOffer || nationalityIsEu) {
        const ocRules: RuleResult[] = [
          evaluateQualificationRecognition(input.highestQualification !== '' ? true : null, ['anabin']),
          evaluateLanguageLevel(input.germanLevel, 'A1', ['make-it-in-germany']),
          input.yearsOfExperience >= 2
            ? { status: 'met', reason: 'Sufficient professional experience for points-based route.', evidence: [], sourceIds: ['make-it-in-germany'] }
            : { status: 'not_met', reason: 'Less than 2 years experience — points may be insufficient.', evidence: [], sourceIds: ['make-it-in-germany'] },
        ];
        const ocCombined = combineResults(ocRules, 'Opportunity Card');
        results.push({
          pathway: 'Opportunity Card',
          slug: 'opportunity-card',
          status: ocCombined.status,
          readiness: { met: ocCombined.met, total: ocRules.length },
          blockers: ocCombined.blockers,
          ruleResults: ocRules,
          alternativePathway: null,
          nextAction: 'Calculate your points for the Opportunity Card.',
        });
      }
    }

    // --- Post-study employment ---
    if (input.goal === 'poststudy') {
      const rules: RuleResult[] = [
        input.hasUniversityAdmission
          ? { status: 'met', reason: 'Graduating or holding a degree from a German university.', evidence: [], sourceIds: ['daad'] }
          : { status: 'unknown', reason: 'German degree status not confirmed.', evidence: [], sourceIds: ['daad'] },
        evaluateLanguageLevel(input.germanLevel, 'B1', ['make-it-in-germany']),
      ];
      results.push({
        pathway: 'Post-Study Employment (18-month residence)',
        slug: 'post-study',
        status: combineResults(rules, 'Post-Study').status,
        readiness: { met: combineResults(rules, 'Post-Study').met, total: rules.length },
        blockers: combineResults(rules, 'Post-Study').blockers,
        ruleResults: rules,
        alternativePathway: 'Skilled Worker Residence Permit',
        nextAction: 'Start the job search during the post-study residence period.',
      });
    }

    return results;
  }
}
