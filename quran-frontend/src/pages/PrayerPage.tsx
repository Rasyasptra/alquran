import DailyPrayers from '../components/Prayer/DailyPrayers';

const PrayerPage = () => {
  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto">
      <div className="container mx-auto px-4 py-6">
        <DailyPrayers />
      </div>
    </div>
  );
};

export default PrayerPage;
