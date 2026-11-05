// Return a suggestion based on the current time and the prayer times from the API
function getSuggestion(timings, now = new Date()) {
  // Fallback: no data available (e.g. prayer times not loaded yet)
  if (!timings || !timings.Fajr || !timings.Sunrise || !timings.Dhuhr ||
      !timings.Asr || !timings.Maghrib || !timings.Isha) {
    return {
      period: 'Unknown',
      text: 'No suggestion available. Please load prayer times first.'
    };
  }

  // Convert each prayer time string into a Date object
  const fajr = timeToDate(timings.Fajr);
  const sunrise = timeToDate(timings.Sunrise);
  const dhuhr = timeToDate(timings.Dhuhr);
  const asr = timeToDate(timings.Asr);
  const maghrib = timeToDate(timings.Maghrib);
  const isha = timeToDate(timings.Isha);

  // Prayer is discouraged for about 15 minutes after sunrise
  const forbiddenEnd = new Date(sunrise.getTime() + 15 * 60 * 1000);

  // Check the current time against each period of the day, in order
  if (now < fajr) {
    return { period: 'Before Fajr',
      text: 'Wake up for Tahajjud and make doa, then prepare for Subuh.' };
  } else if (now < sunrise) {
    return { period: 'Fajr',
      text: 'Perform Solat Subuh, then read morning dhikr and Quran.' };
  } else if (now < forbiddenEnd) {
    return { period: 'After Sunrise',
      text: 'Do not perform any prayer now. Wait a few minutes for the sun to rise, then prepare for Solat Dhuha.' };
  } else if (now < dhuhr) {
    return { period: 'Dhuha',
      text: 'Perform Solat Dhuha and give sadaqah if you can.' };
  } else if (now < asr) {
    return { period: 'Dhuhr',
      text: 'Perform Solat Zohor and read a few pages of Quran.' };
  } else if (now < maghrib) {
    return { period: 'Asr',
      text: 'Perform Solat Asar and read evening dhikr.' };
  } else if (now < isha) {
    return { period: 'Maghrib',
      text: 'Perform Solat Maghrib and make doa before Isha.' };
  } else {
    return { period: 'Isha',
      text: 'Perform Solat Isha and Witir, then read Surah Al-Mulk before sleeping.' };
  }
}