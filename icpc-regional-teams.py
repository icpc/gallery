import sys
import requests
import json
import os
from datetime import datetime

f_uni = None

def get_contest_info(contest_name):
    """Fetch contest info"""
    url = f'https://icpc.global/api/contest/public/{contest_name}'
    response = requests.get(url)
    return response.json()

def get_site(site_id):
    """Fetch contest restults"""
    url = f'https://icpc.global/api/team/search/site/accepted/{site_id}?q=proj:institution,name,teamId%3B&page=1&size=1000'
    response = requests.get(url)
    return response.json()


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

def calculate_teams_in_contest(contest_name):
    response = get_contest_info(contest_name)
    universities = set()
    teams = set()
    for site in response['sites']:
      res = get_site(site['id'])
      for line in res: 
        universities.add (line['institution']) 
        teams.add (line['institution']+": "+ line['name'])
    for team in sorted(teams):
      print (team, file=f_uni)
    print (line['institution']+": "+ line['name'], file=f_uni)
    print ("", file=f_uni)
    for uni in sorted(universities):
      print (uni, file=f_uni)
    if len (universities) == len (teams):
      print ("UNIQUE", file=f_uni)


if __name__ == "__main__":
  

    ROOT_CONTEST = sys.argv[1]
    f_uni = open(str(ROOT_CONTEST)+'_uni.csv', 'w', encoding='utf-8')

    calculate_teams_in_contest(ROOT_CONTEST)
