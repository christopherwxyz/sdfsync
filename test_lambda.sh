# This assumes that the Docker lambda is already running locally on port 9000

if [ -z "$1" ]; then
    echo "No argument was provided. Running with empty default request object: {}"
    request_object="{}"
else
    request_object=$1
fi

curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d "$request_object"
