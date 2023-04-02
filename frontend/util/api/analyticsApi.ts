import {
  AnalyticsGradesType,
  AnalyticsQuestionsType,
  AnalyticsTagSummaryType,
} from "models/analytics.model";
import { BackendLinkType, apiGet } from "./api";
import { getBackendLink } from "./userApi";

export const getAnalyticsGrades = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string }, AnalyticsGradesType>(
    `${getBackendLink(type)}/analytics/grades`,
    token,
    { courseId: courseId },
  );
};

export const getAnalyticsTagsSummary = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string }, AnalyticsTagSummaryType>(
    `${getBackendLink(type)}/analytics/tags/summary`,
    token,
    { courseId: courseId },
  );
};

export const getAnalyticsQuestions = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string }, AnalyticsQuestionsType>(
    `${getBackendLink(type)}/analytics/questions`,
    token,
    { courseId: courseId },
  );
};

// Admin
// TODO
