// @ts-ignore
import { serve, ServerRequest, Response } from "https://deno.land/std/http/server.ts";

import { StringDictionary } from "./types.ts";
import query from "./query.ts";

  
class Params {

  param: StringDictionary;
  query: StringDictionary;

  constructor() {
    this.param = {};
    this.query = {};
  }
  setParam(params: Array<string>, pathes: Array<string>) {
    params.forEach((v, i) => {
      if (v) {
        this.param[v] = pathes[i];
      }
    });
  }
  setQuery(url: string) {
    const [,...queries] = url.split('?');
    const queryStr = queries.join('?');
    this.query = query.parse(queryStr);
  }
}
const enum Method {
  Get = "get",
  Post = "post",
  Put = "put",
  Delete = "delete",
  Patch = "patch",
  Head = "head",
  Options = "options",
}
type RouteHandler = (req: ServerRequest, res: ServerResponse, params: Params) => void;
type RouterPath = { params?: Array<string>, handler?: RouteHandler }
type RouterPaths = {
  [index: string]: RouterPath
}
type Router = {
  [index: string]: RouterPath | RouterPaths
};
export default class Orni {
  private router: any;

  constructor() {
    this.router = {};
  }
  route(method: Method, url: string, handler: RouteHandler) {
    const METHOD = method.toLocaleUpperCase();
    if (!this.router[METHOD]) {
      this.router[METHOD] = {};
    }
    let lastPath = this.router[METHOD];
    let params: Array<string> = [];
    url.split('\/').filter((v) => !!v).forEach((path, i) => {
      let p = path;
      if (path[0] === ':') {
        p = '*';
        params[i] = path.substring(1);
      }

      if (!lastPath[p]) {
        lastPath[p] = {};
      }
      lastPath = lastPath[p];
    });
    lastPath['/'] = { params, handler };

    return this;
  }
  get(url: string, handler: RouteHandler) {
    return this.route(Method.Get, url, handler);
  }
  post(url: string, handler: RouteHandler) {
    return this.route(Method.Post, url, handler);
  }
  put(url: string, handler: RouteHandler) {
    return this.route(Method.Put, url, handler);
  }
  delete(url: string, handler: RouteHandler) {
    return this.route(Method.Delete, url, handler);
  }
  patch(url: string, handler: RouteHandler) {
    return this.route(Method.Patch, url, handler);
  }
  head(url: string, handler: RouteHandler) {
    return this.route(Method.Head, url, handler);
  }
  options(url: string, handler: RouteHandler) {
    return this.route(Method.Options, url, handler);
  }
  private async routeNotFound(req: ServerRequest, res: ServerResponse) {
    return await req.respond({
      status: 404
    });
  }
  private async routeInternalServerError(req: ServerRequest, res: ServerResponse) {
    return await req.respond({
      status: 500
    });
  }
  private async routing(req: ServerRequest) {
    const {method, url} = req;
    const pathes = url.split('?')[0].split('\/').filter((v) => !!v);
    const matchRoute = [method, ...pathes].reduce((r, path) => {
      return r[path] ? r[path] : r['*'] ? r['*'] : null;
    }, this.router);

    if (matchRoute && matchRoute['/']) {
      const {handler, params} = matchRoute['/'];
      const param = new Params();
      param.setParam(params, pathes);
      param.setQuery(url);
      return {handler, param};
    };
    
    return null;
  }
  private async routeMatch(req: ServerRequest) {
    const {method, url} = req;
    console.log(method, url);
    const res = new ServerResponse(req);

    try {
      const route = await this.routing(req);
      if (route && route.handler) {
        return await route.handler(req, res, route.param);
      }
      
      return await this.routeNotFound(req, res);
    } catch(e){
      return await this.routeInternalServerError(req, res);
    }
  }
  private async routeHadle(req: ServerRequest) {
    return await this.routeMatch(req);
  }
  async listen(port: number|string) {
    console.log(`listen: localhost:${port}`);
    const s = serve(`:${port}`);
    for await (const req of s) {
      this.routeHadle(req);
    }
  }
}


class ServerResponse {
  private req: ServerRequest;
  private response: Response;
  constructor(req: ServerRequest) {
    this.req = req;
    this.response = {
      status: 200
    };
  }
  status(code: number) {
    this.response.status = code;
    return this;
  }
  headers(key: string, val: string) {
    if (!this.response.headers) {
      this.response.headers = new Headers();
    }

    this.response.headers.set(key, val);
    return this;
  }

  async text(msg: string) {
    this.headers('Content-Type', 'text/plain');
    this.response.body = new TextEncoder().encode(msg);
    return this.end();
  }
  async json(obj: any) {
    this.headers('Content-Type', 'application/json');
    this.response.body = new TextEncoder().encode(JSON.stringify(obj));
    return this.end();
  }

  async end() {
    return await this.req.respond(this.response);
  }
}