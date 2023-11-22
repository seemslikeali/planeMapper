export default async function fetchData () {
    const url = new URL(
        'https://www.terminalsystems.com/sam.php?Station=');
    const stations = ['YXE', 'YYZ', 'YVR', 'YUL', 'YEG', 'YOW', 'YWG', 
        'YQB', 'YYC', 'YHZ'];
    const data = {
        Cities: {},
        Flights: []
    };

    for (const station of stations) {
        url.searchParams.set('Station', station);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(response.status + ' ' + response.statusText);
            } else {
                const responseData = await response.json();

                data.Cities = { ...data.Cities, ...responseData.Cities };
                data.Flights = [...data.Flights, ...responseData.Flights];
            }
        } catch (error) {
            console.error(error);
        }
    }

    return data;
}