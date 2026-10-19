import fs from "node:fs";
import { calculateExtraFinancials } from "../src/lib/extra-financials.ts";

const read=(path)=>fs.readFileSync(path,"utf8");
const migration=read("database/migrations/030_client_extras_and_coverage_team.sql");
const extras=read("src/lib/client-extras.ts");
const team=read("src/lib/coverage-team.ts");
const portal=read("src/lib/client-portals.ts");
const payments=read("src/lib/invoice-payments.ts");
const actions=read("src/app/admin/clients/[id]/actions.ts");

function requireText(source,pattern,label){if(!pattern.test(source))throw new Error(`FAIL - ${label}`);console.log(`PASS - ${label}`)}
function equal(actual,expected,label){if(actual!==expected)throw new Error(`FAIL - ${label}: expected ${expected}, received ${actual}`);console.log(`PASS - ${label}`)}

requireText(migration,/extra-coverage-hour[\s\S]*150\.00[\s\S]*large-album[\s\S]*300\.00[\s\S]*small-album[\s\S]*100\.00/,"catalog seeds the approved default services and prices");
requireText(migration,/client_extra_services[\s\S]*unit_price DECIMAL[\s\S]*vat_rate DECIMAL[\s\S]*status ENUM\('proposed','agreed','cancelled'\)[\s\S]*internal_note TEXT/,"client extras snapshot price, VAT, status and private notes");
requireText(extras,/status==="agreed"[\s\S]*documentUpdateRequired/,"only agreed extras affect totals and document revision state");
requireText(payments,/baseCollectionTotal[\s\S]*extrasTotal[\s\S]*balanceDue/,"financial summary separates collection, extras and updated balance");
requireText(payments,/requiredDeposit=money\(data\.deposit_amount\)\|\|roundMoney\(baseCollectionTotal\*\.25\)/,"extras do not silently change the agreed deposit");
requireText(payments,/reconcile\(connection,invoice,[^,]+,total,baseCollectionTotal\)/,"payment reconciliation preserves the original-collection deposit basis");
requireText(team,/UNIQUE|already has this role/,"duplicate collaborator assignments are rejected");
requireText(portal,/const extras=portalExtras\.map[\s\S]*const team=portalTeam\.map/,"portal receives explicit privacy-safe projections");
requireText(actions,/saveClientExtraAction[\s\S]*saveTeamAssignmentAction/,"admin actions require explicit saves for extras and assignments");
if(/sendTrackedEmail|sendMail|sendInternalWorkflowNotification/.test(team+extras+actions))throw new Error("FAIL - Sprint 52 admin mutations must not send email");
console.log("PASS - Sprint 52 mutations do not send email");

const baseExample=calculateExtraFinancials([
  {status:"agreed",quantity:2,unitPrice:150,vatRate:0,priceIncludesVat:false},
  {status:"agreed",quantity:1,unitPrice:300,vatRate:0,priceIncludesVat:false},
  {status:"agreed",quantity:2,unitPrice:100,vatRate:0,priceIncludesVat:false},
  {status:"proposed",quantity:10,unitPrice:999,vatRate:0,priceIncludesVat:false},
  {status:"cancelled",quantity:10,unitPrice:999,vatRate:0,priceIncludesVat:false},
]);
equal(baseExample.gross,800,"acceptance example totals €800 before VAT handling");
equal(baseExample.agreedCount,3,"proposed and cancelled extras are excluded");
const excludedVat=calculateExtraFinancials([{status:"agreed",quantity:1,unitPrice:800,vatRate:24,priceIncludesVat:false}]);
equal(excludedVat.net,800,"VAT-exclusive net remains €800");
equal(excludedVat.vat,192,"24% VAT is calculated separately");
equal(excludedVat.gross,992,"VAT-exclusive gross becomes €992");

console.log("PASS - SPRINT 52 EXTRAS AND COVERAGE TEAM CONTRACTS VERIFIED");
