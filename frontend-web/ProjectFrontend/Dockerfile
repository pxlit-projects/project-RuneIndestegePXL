FROM node:18.19-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

FROM nginx
COPY --from=build /usr/src/app/dist/project-frontend/browser /usr/share/nginx/html
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV APIURL=http://localhost:8083

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
