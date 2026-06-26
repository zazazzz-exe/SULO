import type { TourStep } from './TourProvider';

/** The home-screen guided tour. Each id must match a <TourSpot id=…>. */
export const HOME_TOUR: TourStep[] = [
  { id: 'lang', titleKey: 'tour.lang.title', bodyKey: 'tour.lang.body' },
  { id: 'coach', titleKey: 'tour.coach.title', bodyKey: 'tour.coach.body' },
  { id: 'how', titleKey: 'tour.how.title', bodyKey: 'tour.how.body' },
];
