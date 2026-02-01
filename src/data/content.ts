// Sample data structure for content - this would be replaced with actual data from WordPress export

export interface Yearbook {
  id: string;
  year: number;
  title: string;
  description: string;
  coverImage?: string;
  pdfUrl?: string;
  pageCount?: number;
}

export interface PhotoGallery {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  coverImage?: string;
  imageCount: number;
  images?: string[];
}

export interface HistoryPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  category: string;
  author?: string;
  featuredImage?: string;
}

// Yearbooks data (from WordPress)
export const yearbooks: Yearbook[] = [
  { id: "1", year: 1948, title: "Yearbook 1948", description: "The earliest yearbook in our collection", pageCount: 48 },
  { id: "2", year: 1950, title: "Yearbook 1950", description: "Fair Street High School memories", pageCount: 52 },
  { id: "3", year: 1959, title: "Yearbook 1959", description: "A decade of growth", pageCount: 64 },
  { id: "4", year: 1961, title: "Yearbook 1961", description: "The beginning of the sixties", pageCount: 68 },
  { id: "5", year: 1962, title: "Yearbook 1962", description: "Fair Street Tigers", pageCount: 72 },
  { id: "6", year: 1963, title: "Yearbook 1963", description: "Building traditions", pageCount: 76 },
  { id: "7", year: 1964, title: "Yearbook 1964", description: "Pride and excellence", pageCount: 80 },
  { id: "8", year: 1965, title: "Yearbook 1965", description: "Moving forward together", pageCount: 84 },
  { id: "9", year: 1966, title: "Yearbook 1966", description: "E.E. Butler High School", pageCount: 88 },
  { id: "10", year: 1967, title: "Yearbook 1967", description: "Tigers forever", pageCount: 92 },
  { id: "11", year: 1968, title: "Yearbook 1968", description: "Our legacy continues", pageCount: 96 },
  { id: "12", year: 1969, title: "Yearbook 1969", description: "The final chapter", pageCount: 100 },
];

// Photo galleries data (from WordPress)
export const photoGalleries: PhotoGallery[] = [
  { id: "1", title: "Reunion 2019 Pictures", description: "Photos from our biennial reunion celebration", date: "2019-07-20", category: "Events Photos", imageCount: 45 },
  { id: "2", title: "New Year's Party Pictures 2019", description: "Ringing in the new year together", date: "2019-01-01", category: "Events Photos", imageCount: 32 },
  { id: "3", title: "Reunion 2013 Pictures - Sock Hop", description: "Throwback to the sock hop theme", date: "2013-07-15", category: "Events Photos", imageCount: 58 },
  { id: "4", title: "Board of Directors Photos", description: "Our leadership team", date: "2024-01-15", category: "Events Photos", imageCount: 20 },
  { id: "5", title: "Butler Park Dedication", description: "Celebrating our community space", date: "2018-05-10", category: "Events Photos", imageCount: 28 },
  { id: "6", title: "Scholarship Awards Ceremony", description: "Honoring our scholarship recipients", date: "2023-06-15", category: "Events Photos", imageCount: 15 },
];

// History posts data (from WordPress categories)
export const historyPosts: HistoryPost[] = [
  // Community History
  { id: "1", title: "The History of Fair Street High School", content: "", excerpt: "Fair Street High School was established to serve the African American community of Gainesville...", date: "2020-02-15", category: "Community History" },
  { id: "2", title: "Southside Community Stories", content: "", excerpt: "The Southside community was the heart of African American life in Gainesville...", date: "2020-03-10", category: "Community History" },

  // Black History
  { id: "3", title: "Gainesville Leader Fought for Equality", content: "", excerpt: "Breaking barriers at Fair Street High School while fighting for civil rights...", date: "2021-02-01", category: "Black History" },
  { id: "4", title: "Pioneers of Education", content: "", excerpt: "The educators who shaped generations of students...", date: "2021-02-15", category: "Black History" },

  // Sports
  { id: "5", title: "Fair Street Tigers Football Legacy", content: "", excerpt: "The football program that built champions on and off the field...", date: "2019-09-01", category: "Sports" },
  { id: "6", title: "Basketball Championships", content: "", excerpt: "Remembering the championship seasons that united our community...", date: "2019-10-15", category: "Sports" },

  // School Memories
  { id: "7", title: "Cafeteria On the Hill", content: "", excerpt: "A personal memory by James Lytle, Class of 1965...", date: "2018-05-20", category: "School Memories" },
  { id: "8", title: "The GENTS and ESQUIRES", content: "", excerpt: "Mr. Nathaniel Shelton's GENTS and Mr. Marcellus Barksdale's ESQUIRES...", date: "2018-06-10", category: "School Memories" },

  // Mason Said It
  { id: "9", title: "Wisdom from Mason", content: "", excerpt: "Timeless wisdom and sayings from our community...", date: "2020-01-15", category: "Mason Said It" },

  // Newsletters
  { id: "10", title: "2024 Spring Newsletter", content: "", excerpt: "Updates from the Alumni Association board...", date: "2024-03-01", category: "Newsletters" },
  { id: "11", title: "2023 Annual Report", content: "", excerpt: "A year of accomplishments and community service...", date: "2023-12-15", category: "Newsletters" },
];

// Categories with counts (matching WordPress)
export const categories = [
  { name: "Community History", count: 50, slug: "community-history" },
  { name: "Black History", count: 34, slug: "black-history" },
  { name: "Events Photos", count: 27, slug: "events-photos" },
  { name: "Mason Said It", count: 24, slug: "mason-said-it" },
  { name: "Fun Stuff", count: 23, slug: "fun-stuff" },
  { name: "Sports", count: 21, slug: "sports" },
  { name: "School Memories", count: 12, slug: "school-memories" },
  { name: "Yearbooks", count: 11, slug: "yearbooks" },
  { name: "Reunions", count: 9, slug: "reunions" },
  { name: "Politics & Opinions", count: 9, slug: "politics-opinions" },
  { name: "Scholarships/Education", count: 8, slug: "scholarships" },
  { name: "Newsletters", count: 5, slug: "newsletters" },
];
