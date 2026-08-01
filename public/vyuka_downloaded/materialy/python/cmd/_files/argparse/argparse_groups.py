from argparse import ArgumentParser

parser = ArgumentParser()
parser.add_argument('--version', action='version', version='1.0')

group1 = parser.add_argument_group(title="common arguments", description="")
group1.add_argument("-x", "--xhtml",
                    action="store_true",
                    default=False,
                    help="create a XHTML template instead of HTML")
group1.add_argument("-c", "--cssfile",
                    default="style.css",
                    help="CSS file to link",)
group1.add_argument("file",
                    help="main HTML file to work with")

args = parser.parse_args()
print( args )
