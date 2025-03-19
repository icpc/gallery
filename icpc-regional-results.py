import sys
import requests
import json
import os
from datetime import datetime

f_uni = None


def get_contest_results(region_id):
    """Fetch contest restults"""
    url = f'https://icpc.global/api/contest/public/search/contest/{region_id}?q=proj:&page=1&size=1000'
    response = requests.get(url)
    return response.json()

def calculate_uni_teams(contest_id):
        res = get_contest_results(contest_id)
        universities = set()
        teams = set()
        for line in res: 
            universities.add (line['institution']) 
            teams.add (line['institution']+": "+ line['teamName'])
        for team in sorted(teams):
            print (team, file=f_uni)
        print (line['institution']+": "+ line['teamName'], file=f_uni)
        print ("", file=f_uni)
        for uni in sorted(universities):
            print (uni, file=f_uni)
        if len (universities) == len (teams):
            print ("UNIQUE", file=f_uni)

if __name__ == "__main__":
  

    ROOT_CONTEST = sys.argv[1]
    f_uni = open(str(ROOT_CONTEST)+'_uni.csv', 'w', encoding='utf-8')


    calculate_uni_teams (ROOT_CONTEST)

#    main([7724, 8893, 8887, 8890, 9128, 9096, 8905, 8896, 8895, 8898, 8892, 8910, 8907, 8900, 8889, 8913, 8901, 8903, 8911])
