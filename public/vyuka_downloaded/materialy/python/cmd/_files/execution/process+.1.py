import subprocess

with open('process+.1.out1', 'w') as f:
    proces = subprocess.run("ls", stdout=f)
    print('A:', proces)

args = ['ls', '-al']
with open('process+.1.out2', 'w') as f:
    proces = subprocess.run(args, stdout=f)
    print('B:', proces)
