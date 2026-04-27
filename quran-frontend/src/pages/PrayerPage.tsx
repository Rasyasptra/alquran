import DailyPrayers from '../components/Prayer/DailyPrayers';

const PrayerPage = () => {
  return (
    <div className="flex-1 w-full h-full bg-[var(--islamic-background)] overflow-y-auto">
      <div className="w-full px-4 py-6">
        <DailyPrayers />
      </div>
    </div>
  );
};

export default PrayerPage;
