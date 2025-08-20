import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Options {
  headers?: HttpHeaders;
  params?: HttpParams;
}
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private allowedHeaders = ['Authorization', 'X-Requested-With'];

  private http = inject(HttpClient);

  public createDefaultOptions(): Options {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  public doGet<T>(serviceUrl: string, opts?: Options): Observable<T> {
    if (opts) {
      const ropts = this.createOptions(opts);
      return this.http.get<T>(serviceUrl, ropts);
    }
    return this.http.get<T>(serviceUrl);
  }

  public doPost<T, R>(
    serviceUrl: string,
    body: T,
    opts?: Options
  ): Observable<R> {
    if (opts) {
      const ropts = this.createOptions(opts);
      return this.http.post<R>(serviceUrl, body, ropts);
    }
    return this.http.post<R>(serviceUrl, body);
  }

  public doPut<T, R>(
    serviceUrl: string,
    body: T,
    opts?: Options
  ): Observable<R> {
    if (opts) {
      const ropts = this.createOptions(opts);
      return this.http.put<R>(serviceUrl, body, ropts);
    }
    return this.http.put<R>(serviceUrl, body);
  }

  public doPatch<T, R>(
    serviceUrl: string,
    body: T,
    opts?: Options
  ): Observable<R> {
    if (opts) {
      const ropts = this.createOptions(opts);
      return this.http.patch<R>(serviceUrl, body, ropts);
    }
    return this.http.patch<R>(serviceUrl, body);
  }

  public doDelete<R>(serviceUrl: string, opts?: Options): Observable<R> {
    if (opts) {
      const ropts = this.createOptions(opts);
      return this.http.delete<R>(serviceUrl, ropts);
    }
    return this.http.delete<R>(serviceUrl);
  }

  public doGetParameters<T>(
    serviceUrl: string,
    parametros: HttpParams,
    opts?: Options
  ): Observable<T> {
    const ropts = opts ? this.createOptions(opts) : this.createDefaultOptions();
    const options =
      parametros !== null
        ? ({
            headers: ropts.headers,
            params: parametros,
          } as Options)
        : ropts;

    return this.http.get<T>(serviceUrl, options);
  }

  public setHeader(name: string, value: string): Options {
    if (this.allowedHeaders.includes(name)) {
      const newopts = this.createDefaultOptions();
      newopts.headers = newopts.headers?.set(name, value);
      return newopts;
    } else {
      throw new Error(
        `El encabezado ${name} no está permitido para ser modificado.`
      );
    }
  }

  private createOptions(opts: Options): Options {
    const defaultOpts: Options = this.createDefaultOptions();

    if (opts) {
      opts = {
        params: opts.params ?? defaultOpts.params,
        headers: opts.headers ?? defaultOpts.headers,
      };

      if (opts.headers) {
        if (!opts.headers.get('Content-Type')) {
          const defaultContentType = defaultOpts.headers?.get('Content-Type');
          if (defaultContentType) {
            opts.headers = opts.headers.set('Content-Type', defaultContentType);
          }
        }
      }
    }

    return opts || defaultOpts;
  }
}