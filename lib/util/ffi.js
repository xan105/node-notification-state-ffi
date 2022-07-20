/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import ffi from "ffi-napi";
import { Failure, errorLookup } from "@xan105/error";
import { shouldStringNotEmpty, shouldObj } from "@xan105/is/assert";
import { asStringNotEmpty, asBoolean } from "@xan105/is/opt";

function load(name, option = {}){
  
  shouldStringNotEmpty(name);
  
  const options = {
    mode: asStringNotEmpty(option.mode) ?? "RTLD_NOW",
    silentFail: asBoolean(option.silentFail) ?? false
  };
  
  let lib;
  try{
    const { FLAGS } = ffi.DynamicLibrary;
    lib = ffi.DynamicLibrary(name, FLAGS[options.mode] ?? FLAGS.RTLD_NOW, ffi.FFI_WIN64);
  }catch(err){
    const errCode = RegExp(/\d+$/).exec(err)?.[0];
    if(errCode === null) //If couldn't extract error code
      throw err; //Throw the default ffi error
    else {
      const [ message, code ] = errorLookup(+errCode); //lookup error code
      throw new Failure(message, { code, cause: err, info: name });
    }
  }
  
  return function(fnSymbol, resultType, paramType){
    shouldStringNotEmpty(fnSymbol);
    try{
      const fnPtr = lib.get(fnSymbol);
      return ffi.ForeignFunction(fnPtr, resultType, paramType);
    }catch(err){
      if (options.silentFail) return null;
      const errCode = RegExp(/\d+$/).exec(err)?.[0];
      if(errCode === null) //If couldn't extract error code
        throw err; //Throw the default ffi error
      else {
        const [ message, code ] = errorLookup(+errCode); //lookup error code
        throw new Failure(message, { code, cause: err, info: fnSymbol });
      }
    }
  };
}

export { load }