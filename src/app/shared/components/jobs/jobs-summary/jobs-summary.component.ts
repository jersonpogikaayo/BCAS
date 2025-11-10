// Create: src/app/shared/components/job-summary/job-summary.component.ts

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Job, TestEquipmentDisplay } from 'src/app/core/models/test-equipments/test-equipments.model';
import { SurveyProcessService } from 'src/app/core/services/common/survey-process.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';

export interface JobSummaryData {
  equipmentChecks: any;
  surveyData: any;
  testEquipments: TestEquipmentDisplay[];
  jobDetails: any;
}

@Component({
  selector: 'app-jobs-summary',
  templateUrl: './jobs-summary.component.html',
  styleUrls: ['./jobs-summary.component.scss']
})
export class JobsSummaryComponent implements OnInit {
  @Input() summaryData: JobSummaryData | null = null;
  @Input() isCompleted: boolean = false;
  @Input() currentAnswers: any[] = [];
  
  jobSummaryResponse: any = null;
  surveyAnswers: any[] = [];
  surveyWithSections: any = null;
  selectedImage: string = '';

  constructor(
    private jobHttpRequestsService: JobsHttpRequestsService,
    public surveyProcessService: SurveyProcessService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Job Summary Data:', this.summaryData);
    if (this.summaryData) {
      this.loadJobSummaryData(this.summaryData?.jobDetails.id);
    }
    console.log(this.currentAnswers);
  }

  loadJobSummaryData(jobId: number): void {
    console.log('🔍 Loading job summary for ID:', jobId);
    
    this.jobHttpRequestsService.getJobSummaryById(jobId).subscribe({
      next: (jobSummary) => {
        console.log('✅ Job summary response:', jobSummary);
        console.log('📋 Job summary answers:', jobSummary.answers);
        console.log('📝 Summary data survey:', this.summaryData?.surveyData);
        
        this.jobSummaryResponse = jobSummary;
        this.surveyAnswers = jobSummary.answers || [];
        
        // Merge answers into survey structure from summaryData
        if (this.summaryData?.surveyData.survey && jobSummary.answers) {
          this.surveyWithSections = this.mergeAnswersIntoSurvey(
            this.summaryData.surveyData.survey, 
            this.currentAnswers
          );
          this.summaryData.surveyData.survey = this.surveyWithSections;
          console.log('🔗 Updated SummaryData:', this.summaryData);
          console.log('✅ Merged survey with answers:', this.surveyWithSections);
          this.cdr.detectChanges();
        } else {
          console.log('⚠️ No survey structure or answers to merge');
          this.surveyWithSections = this.summaryData?.surveyData.survey || null;
        }
      },
      error: (error) => {
        console.error('❌ Error loading job summary:', error);
      }
    });
  }

  private mergeAnswersIntoSurvey(survey: any, answers: any[]): any {
  console.log('🔀 Merging answers into survey...');
  
  // Create a map of answers by questionId for faster lookup
  const answersMap = new Map();
  answers.forEach(answer => {
    answersMap.set(answer.questionId, answer);
  });
  
  console.log('📊 Answers map:', answersMap);
  
  // Clone the survey to avoid modifying the original
  const mergedSurvey = JSON.parse(JSON.stringify(survey));
  
  // Iterate through sections and questions to add answers
  if (mergedSurvey.sections && Array.isArray(mergedSurvey.sections)) {
    mergedSurvey.sections.forEach((section: any, sectionIndex: number) => {
      console.log(`🗂️ Processing section ${sectionIndex + 1}:`, section.title);
      
      if (section.questions && Array.isArray(section.questions)) {
        section.questions.forEach((question: any, questionIndex: number) => {
          const answer = answersMap.get(question.id);
          
          if (answer) {
            console.log(`✅ Found answer for question ${question.id}:`, answer);
            question.answer = answer;
            question.hasAnswer = true;
            question.answerValue = answer.value;
            question.answerPass = answer.pass;
            question.answerFailValue = answer.failValue;
            question.lastModified = answer.lastModifiedDate;
            question.lastModifiedBy = answer.lastModifiedUser;
          } else {
            console.log(`⚠️ No answer found for question ${question.id}`);
            question.answer = null;
            question.hasAnswer = false;
            question.answerValue = null;
            question.answerPass = null;
          }
        });
        
        // Log section summary
        const answeredQuestions = section.questions.filter((q: any) => q.hasAnswer).length;
        console.log(`📊 Section "${section.title}": ${answeredQuestions}/${section.questions.length} questions answered`);
      }
    });
  }
  
  return mergedSurvey;
}

  /**
   * Get survey responses summary
   */
  getSurveyResponsesSummary(): any[] {
    if (!this.summaryData?.surveyData?.survey?.sections || !this.summaryData?.surveyData?.formData) {
      return [];
    }

    const sections = this.summaryData.surveyData.survey.sections;
    const formData = this.summaryData.surveyData.formData;
    const responses: any = [];

    console.log('Survey sections:', sections);
    console.log('Form data:', formData);

    // Loop through sections
    sections.forEach((section: any, sectionIndex: number) => {
      if (section.questions && section.questions.length > 0) {
        // Add section header
        responses.push({
          isSectionHeader: true,
          sectionTitle: section.title || section.name || `Section ${sectionIndex + 1}`,
          sectionIndex: sectionIndex
        });

        // Loop through questions in section
        section.questions.forEach((question: any, questionIndex: number) => {
          const questionKey = `section_${sectionIndex}_question_${questionIndex}`;
          const answer = formData[questionKey] || formData[question.id] || 'No answer provided';

          responses.push({
            isSectionHeader: false,
            sectionTitle: section.title || section.name || `Section ${sectionIndex + 1}`,
            sectionIndex: sectionIndex,
            questionIndex: questionIndex,
            questionNumber: questionIndex + 1,
            question: question.text || question.title || question.label || `Question ${questionIndex + 1}`,
            questionType: question.type || 'text',
            answer: this.formatAnswer(answer, question.type),
            rawAnswer: answer,
            questionId: question.id
          });
        });
      }
    });

    console.log('Processed survey responses:', responses);
    return responses;
  }

  /**
   * Format answer based on question type
   */
  private formatAnswer(answer: any, questionType: string): string {
    if (answer === null || answer === undefined || answer === '') {
      return 'No answer provided';
    }

    switch (questionType) {
      case 'boolean':
      case 'checkbox':
        return answer ? 'Yes' : 'No';
      
      case 'radio':
      case 'select':
        return String(answer);
      
      case 'multiple':
      case 'multiselect':
        if (Array.isArray(answer)) {
          return answer.length > 0 ? answer.join(', ') : 'None selected';
        }
        return String(answer);
      
      case 'number':
        return typeof answer === 'number' ? answer.toString() : String(answer);
      
      case 'date':
        if (answer instanceof Date) {
          return answer.toLocaleDateString();
        }
        return String(answer);
      
      default:
        return String(answer);
    }
  }

  /**
   * Get answer type class for styling
   */
  getAnswerTypeClass(questionType: string): string {
    switch (questionType) {
      case 'boolean':
      case 'checkbox':
        return 'badge bg-success-subtle text-success';
      case 'radio':
      case 'select':
        return 'badge bg-primary-subtle text-primary';
      case 'multiple':
      case 'multiselect':
        return 'badge bg-info-subtle text-info';
      case 'number':
        return 'badge bg-warning-subtle text-warning';
      default:
        return 'badge bg-light text-dark';
    }
  }

  /**
   * Get test equipment summary
   */
  getTestEquipmentSummary(): TestEquipmentDisplay[] {
    return this.summaryData?.testEquipments || [];
  }

  /**
   * Check if summary has data
   */

  getCheckResultClass(value: string): string {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue === 'pass' || lowerValue === 'yes' || lowerValue === 'ok' || lowerValue === 'good') {
      return 'badge bg-success-subtle text-success';
    }
    if (lowerValue === 'fail' || lowerValue === 'no' || lowerValue === 'bad' || lowerValue === 'error') {
      return 'badge bg-danger-subtle text-danger';
    }
    if (lowerValue === 'warning' || lowerValue === 'caution' || lowerValue === 'partial') {
      return 'badge bg-warning-subtle text-warning';
    }
    
    return 'badge bg-light text-dark';
  }

  /**
   * Get icon for check result
   */
  getCheckResultIcon(value: string): string {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue === 'pass' || lowerValue === 'yes' || lowerValue === 'ok' || lowerValue === 'good') {
      return 'ri-check-line';
    }
    if (lowerValue === 'fail' || lowerValue === 'no' || lowerValue === 'bad' || lowerValue === 'error') {
      return 'ri-close-line';
    }
    if (lowerValue === 'warning' || lowerValue === 'caution' || lowerValue === 'partial') {
      return 'ri-alert-line';
    }
    
    return 'ri-information-line';
  }

  getQuestionTypeId(questionType: string): number {
    const typeMap: { [key: string]: number } = {
      'date': 1,
      'text': 2,
      'textarea': 2,
      'number': 3,
      'decimal': 3,
      'radio': 4,
      'select': 4,
      'checkbox': 5,
      'boolean': 5,
      'range': 6,
      'image': 7,
      'file': 8,
      'signature': 9
    };
    return typeMap[questionType?.toLowerCase()] || 2; // Default to text
  }

  openImageModal(imageUrl: string): void {
    this.selectedImage = imageUrl;
    // You can use Bootstrap modal or Angular Material dialog here
  }


  isImageAnswer(value: any): boolean {
    return typeof value === 'string' && (value.startsWith('data:image/') || !!value.match(/\.(jpeg|jpg|gif|png)$/i));
  }

}