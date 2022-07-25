.PHONY: build run

build:
	docker buildx build -t epp-image-server --load .

run:
	docker run -it --rm -p 8182:8182 epp-image-server
