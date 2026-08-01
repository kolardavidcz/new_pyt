#!/usr/bin/env python3

import matplotlib.pyplot as plt     # plotící knihovna
from datetime import datetime       # převod času

# data pro významná zemětřesení v Maďarsku
earthquakes_in_Hungary = """
date	time	place	magnitudo	latitude	longitude
02.11.2011	00:56 SEČ	Győr	3.4	47.701°	17.436°
29.01.2011	18:41 SEČ	Tatabánya	4.3	47.510°	18.380°
15.05.2005	15:30 SELČ		3.4	47.300°	17.500°
25.05.2004	09:30 SELČ		3.4	47.500°	17.300°
10.08.2003	00:01 SELČ		3.2	47.000°	16.700°
"""
data = []
for quake in earthquakes_in_Hungary.split('\n')[2:-1]:
    date, time, place, magnitudo, latitude, longitude = quake.split('\t')
    data.append( (date, place, float(magnitudo)) )

# vlastní graf
dates, quakes = [], []
for date, place, magnitudo in data:
    datum = datetime.strptime(date, '%d.%m.%Y')
    dates.append(datum)
    quakes.append(magnitudo)
    plt.annotate(place, xy=(datum,magnitudo), xytext=(-23, 5), textcoords='offset points')
plt.plot_date(dates, quakes, 'go')

# nastavení a popisky os
plt.xlim(datetime(2003,1,1), datetime(2012,1,1))
plt.xlabel('datum')
plt.ylim(3, 4.5)
plt.ylabel('magnitudo')
# zobrazení grafu
plt.show()
