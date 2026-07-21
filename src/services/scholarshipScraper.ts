/**
 * Scholarship Data Scraper
 * Sources: Public APIs and web scraping from scholarship databases
 */

import axios from 'axios';

export interface RawScholarshipData {
  title: string;
  provider: string;
  description: string;
  country: string;
  academic_field: string;
  education_level: string;
  deadline: string;
  application_link: string;
}

/**
 * Scrape from Scholarships.com API (public data)
 */
export async function scrapeScholarshipsComData(): Promise<RawScholarshipData[]> {
  try {
    // Public scholarship data source
    const response = await axios.get(
      'https://api.scholarships.com/v1/opportunities?limit=50',
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ScholarSync/1.0)',
        },
      }
    );

    return response.data.opportunities?.map((opp: any) => ({
      title: opp.name || 'Untitled Scholarship',
      provider: opp.provider || 'Scholarships.com',
      description: opp.description || '',
      country: opp.country || 'International',
      academic_field: normalizeField(opp.field_of_study?.name || 'General'),
      education_level: normalizeLevel(opp.education_level || 'Undergraduate'),
      deadline: formatDate(opp.application_deadline),
      application_link: opp.application_url || '#',
    })) || [];
  } catch (error) {
    console.error('Error scraping Scholarships.com:', error);
    return [];
  }
}

/**
 * Scrape from MastersPortal (European scholarships)
 */
export async function scrapeMastersPortalData(): Promise<RawScholarshipData[]> {
  try {
    const response = await axios.get(
      'https://www.mastersportal.com/api/scholarships?limit=50',
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ScholarSync/1.0)',
        },
      }
    );

    return response.data.results?.map((scholarship: any) => ({
      title: scholarship.title || 'Untitled Scholarship',
      provider: scholarship.university?.name || 'MastersPortal',
      description: scholarship.description || '',
      country: scholarship.country?.name || 'Europe',
      academic_field: normalizeField(scholarship.field?.name || 'General'),
      education_level: 'Master',
      deadline: formatDate(scholarship.deadline),
      application_link: scholarship.url || '#',
    })) || [];
  } catch (error) {
    console.error('Error scraping MastersPortal:', error);
    return [];
  }
}

/**
 * Scrape from Erasmus Mundus (EU scholarships)
 */
export async function scrapeErasmusMundusData(): Promise<RawScholarshipData[]> {
  try {
    const response = await axios.get(
      'https://www.erasmusmundus.org/scholarships/list',
      {
        timeout: 10000,
      }
    );

    // Parse HTML or JSON depending on response
    const scholarships = Array.isArray(response.data) ? response.data : [];

    return scholarships.map((scholarship: any) => ({
      title: scholarship.name || 'Untitled Scholarship',
      provider: 'Erasmus Mundus',
      description: scholarship.description || '',
      country: scholarship.countries?.join(', ') || 'EU',
      academic_field: normalizeField(scholarship.subject || 'General'),
      education_level: 'Master',
      deadline: formatDate(scholarship.deadline),
      application_link: scholarship.apply_url || '#',
    }));
  } catch (error) {
    console.error('Error scraping Erasmus Mundus:', error);
    return [];
  }
}

/**
 * Seed data - Can be expanded with more sources
 */
export function generateSeedData(): RawScholarshipData[] {
  return [
    {
      title: 'Global Leaders Scholarship Program',
      provider: 'Global Scholarship Foundation',
      description: 'Competitive scholarship for exceptional students pursuing higher education globally.',
      country: 'International',
      academic_field: 'Engineering',
      education_level: 'Undergraduate',
      deadline: '2026-06-30',
      application_link: 'https://scholarshipfoundation.org/apply',
    },
    {
      title: 'Tech Innovators Fellowship',
      provider: 'TechCorp Foundation',
      description: 'For students passionate about technology and innovation.',
      country: 'USA',
      academic_field: 'Computer Science',
      education_level: 'Graduate',
      deadline: '2026-05-15',
      application_link: 'https://techcorp.org/fellowship',
    },
    {
      title: 'Environmental Leaders Grant',
      provider: 'Green Future Initiative',
      description: 'Supporting students in environmental science and sustainability.',
      country: 'International',
      academic_field: 'Environmental Science',
      education_level: 'Undergraduate',
      deadline: '2026-07-31',
      application_link: 'https://greenfuture.org/apply',
    },
    {
      title: 'Medical Excellence Scholarship',
      provider: 'Healthcare Foundation',
      description: 'For top medical and health science students worldwide.',
      country: 'International',
      academic_field: 'Medicine',
      education_level: 'Graduate',
      deadline: '2026-04-30',
      application_link: 'https://healthcarefoundation.org/medical',
    },
    {
      title: 'Business Leaders Program',
      provider: 'MBA Excellence',
      description: 'MBA and business administration scholarships for ambitious professionals.',
      country: 'International',
      academic_field: 'Business',
      education_level: 'Graduate',
      deadline: '2026-08-15',
      application_link: 'https://mbaexcellence.org/apply',
    },
  ];
}

/**
 * Combine all scholarship sources
 */
export async function getAllScholarshipData(): Promise<RawScholarshipData[]> {
  const sources = await Promise.allSettled([
    scrapeScholarshipsComData(),
    scrapeMastersPortalData(),
    scrapeErasmusMundusData(),
  ]);

  let allScholarships: RawScholarshipData[] = [];

  sources.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allScholarships = allScholarships.concat(result.value);
    } else {
      console.warn(`Source ${index} failed:`, result.reason);
    }
  });

  // If scraping fails, use seed data as fallback
  if (allScholarships.length === 0) {
    console.log('Using seed data as fallback...');
    allScholarships = generateSeedData();
  }

  // Remove duplicates and clean data
  return Array.from(new Map(
    allScholarships.map(s => [s.title.toLowerCase().trim(), s])
  ).values());
}

/**
 * Helper: Normalize academic field names
 */
function normalizeField(field: string): string {
  const fieldMap: Record<string, string> = {
    'computer science': 'Computer Science',
    'engineering': 'Engineering',
    'medicine': 'Medicine',
    'business': 'Business',
    'arts': 'Arts & Humanities',
    'science': 'Natural Sciences',
    'social science': 'Social Sciences',
    'environmental': 'Environmental Science',
    'law': 'Law',
    'education': 'Education',
  };

  const normalized = field.toLowerCase().trim();
  for (const [key, value] of Object.entries(fieldMap)) {
    if (normalized.includes(key)) return value;
  }

  return field || 'General';
}

/**
 * Helper: Normalize education level
 */
function normalizeLevel(level: string): string {
  const lower = level.toLowerCase();
  if (lower.includes('master') || lower.includes('graduate')) return 'Graduate';
  if (lower.includes('phd') || lower.includes('doctorate')) return 'PhD';
  if (lower.includes('high school')) return 'High School';
  return 'Undergraduate';
}

/**
 * Helper: Format date to YYYY-MM-DD
 */
function formatDate(date: any): string {
  if (!date) return '2026-12-31';
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch {
    return '2026-12-31';
  }
}
